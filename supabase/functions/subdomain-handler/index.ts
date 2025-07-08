import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const host = req.headers.get('host') || url.hostname
    
    // Check if this is a subdomain request (*.gstartup.pro)
    if (host.endsWith('.gstartup.pro') && host !== 'gstartup.pro') {
      const subdomain = host.replace('.gstartup.pro', '')
      
      // Initialize Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseKey)
      
      // Find vendor by subdomain
      const { data: vendor, error } = await supabase
        .from('vendors')
        .select('id, business_name, is_active')
        .eq('subdomain', subdomain)
        .eq('is_active', true)
        .single()
      
      if (error || !vendor) {
        return new Response('Boutique non trouvée', { 
          status: 404,
          headers: corsHeaders
        })
      }
      
      // Return vendor info for the frontend to handle
      return new Response(JSON.stringify({
        vendorId: vendor.id,
        businessName: vendor.business_name,
        subdomain: subdomain,
        isSubdomain: true
      }), {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      })
    }
    
    return new Response('Not a subdomain request', { 
      status: 400,
      headers: corsHeaders
    })
    
  } catch (error) {
    console.error('Error in subdomain handler:', error)
    return new Response('Internal server error', { 
      status: 500,
      headers: corsHeaders
    })
  }
})