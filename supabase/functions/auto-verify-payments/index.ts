import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  console.log('🔄 Auto-verify-payments function started')

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get global payment configuration
    const { data: paymentConfig, error: configError } = await supabase
      .from('global_payment_config')
      .select('*')
      .eq('is_active', true)
      .single()

    if (configError || !paymentConfig?.moneroo_api_key) {
      console.error('❌ No active payment configuration found')
      return new Response(
        JSON.stringify({ error: 'No active payment configuration' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get pending transactions from last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    
    const { data: pendingTransactions, error: transactionsError } = await supabase
      .from('moneroo_transactions')
      .select('*')
      .eq('status', 'pending')
      .gte('created_at', twentyFourHoursAgo)

    if (transactionsError) {
      console.error('❌ Error fetching pending transactions:', transactionsError)
      return new Response(
        JSON.stringify({ error: 'Error fetching transactions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    if (!pendingTransactions || pendingTransactions.length === 0) {
      console.log('✅ No pending transactions to verify')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No pending transactions to verify',
          verified: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`🔍 Found ${pendingTransactions.length} pending transactions to verify`)

    let verifiedCount = 0
    let updatedCount = 0
    const errors = []

    // Verify each transaction with Moneroo API
    for (const transaction of pendingTransactions) {
      try {
        console.log(`🔍 Verifying transaction: ${transaction.transaction_id}`)

        // Call Moneroo API to verify payment status
        const monerooResponse = await fetch(`https://api.moneroo.io/v1/payments/${transaction.transaction_id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${paymentConfig.moneroo_api_key}`,
            'Content-Type': 'application/json',
          },
        })

        if (!monerooResponse.ok) {
          console.error(`❌ Moneroo API error for ${transaction.transaction_id}:`, monerooResponse.status)
          errors.push(`API error for ${transaction.transaction_id}: ${monerooResponse.status}`)
          continue
        }

        const monerooData = await monerooResponse.json()
        console.log(`📊 Moneroo response for ${transaction.transaction_id}:`, JSON.stringify(monerooData, null, 2))
        console.log(`📊 Moneroo status for ${transaction.transaction_id}:`, monerooData.data?.status)

        verifiedCount++

        // Map Moneroo status to internal status
        let newStatus = 'pending'
        let orderStatus = 'pending'
        let paymentStatus = 'pending'

        switch (monerooData.data?.status?.toLowerCase()) {
          case 'success':
          case 'succeeded':
          case 'completed':
            newStatus = 'success'
            orderStatus = 'confirmed'
            paymentStatus = 'paid'
            break
          case 'failed':
          case 'error':
            newStatus = 'failed'
            orderStatus = 'cancelled'
            paymentStatus = 'failed'
            break
          case 'cancelled':
          case 'canceled':
            newStatus = 'cancelled'
            orderStatus = 'cancelled'
            paymentStatus = 'cancelled'
            break
          default:
            // Status unchanged - still pending
            continue
        }

        // Only update if status has changed
        if (newStatus !== transaction.status) {
          console.log(`🔄 Updating transaction ${transaction.transaction_id} from ${transaction.status} to ${newStatus}`)

          // Update transaction status
          const { error: updateError } = await supabase
            .from('moneroo_transactions')
            .update({
              status: newStatus,
              webhook_data: {
                id: transaction.transaction_id,
                status: newStatus,
                message: 'Auto-verified via API check',
                timestamp: new Date().toISOString(),
                api_response: monerooData
              },
              updated_at: new Date().toISOString()
            })
            .eq('transaction_id', transaction.transaction_id)

          if (updateError) {
            console.error(`❌ Error updating transaction ${transaction.transaction_id}:`, updateError)
            errors.push(`Update error for ${transaction.transaction_id}: ${updateError.message}`)
            continue
          }

          // Update order status
          const { error: orderError } = await supabase
            .from('orders')
            .update({
              status: orderStatus,
              payment_status: paymentStatus,
              updated_at: new Date().toISOString()
            })
            .eq('id', transaction.order_id)

          if (orderError) {
            console.error(`❌ Error updating order for transaction ${transaction.transaction_id}:`, orderError)
            errors.push(`Order update error for ${transaction.transaction_id}: ${orderError.message}`)
            continue
          }

          updatedCount++

          // If payment is successful, trigger email notifications
          if (newStatus === 'success') {
            console.log(`📧 Triggering notifications for successful payment: ${transaction.transaction_id}`)
            
            try {
              const notificationResponse = await supabase.functions.invoke('send-email-notifications', {
                body: { 
                  orderId: transaction.order_id,
                  type: 'payment_success',
                  transactionId: transaction.transaction_id
                }
              })
              
              if (notificationResponse.error) {
                console.error('❌ Notification error:', notificationResponse.error)
              } else {
                console.log('✅ Notifications sent successfully')
              }
            } catch (notificationError) {
              console.error('❌ Failed to send notifications:', notificationError)
              // Don't fail the whole process for notification errors
            }
          }

          console.log(`✅ Successfully updated transaction ${transaction.transaction_id}`)
        }

      } catch (error) {
        console.error(`❌ Error verifying transaction ${transaction.transaction_id}:`, error)
        errors.push(`Verification error for ${transaction.transaction_id}: ${error.message}`)
      }
    }

    console.log(`✅ Auto-verification complete: ${verifiedCount} verified, ${updatedCount} updated`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Auto-verification completed',
        verified: verifiedCount,
        updated: updatedCount,
        total_pending: pendingTransactions.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Auto-verify-payments error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
