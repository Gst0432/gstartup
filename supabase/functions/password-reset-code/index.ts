import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SendCodeRequest {
  action: 'send_code'
  email: string
}

interface VerifyResetRequest {
  action: 'verify_and_reset'
  email: string
  code: string
  newPassword: string
}

type RequestBody = SendCodeRequest | VerifyResetRequest

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const body: RequestBody = await req.json()
    
    if (body.action === 'send_code') {
      console.log('Sending reset code for email:', body.email)
      
      // Vérifier si l'utilisateur existe
      const { data: users, error: userError } = await supabase.auth.admin.listUsers()
      if (userError) {
        console.error('Error checking user:', userError)
        throw new Error('Erreur lors de la vérification de l\'utilisateur')
      }

      const userExists = users.users.some(user => user.email === body.email)
      if (!userExists) {
        console.log('User not found for email:', body.email)
        // Pour des raisons de sécurité, on retourne succès même si l'utilisateur n'existe pas
        return new Response(
          JSON.stringify({ success: true, message: 'Si cette adresse email existe, un code a été envoyé.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Nettoyer les anciens codes pour cet email
      await supabase
        .from('password_reset_codes')
        .delete()
        .eq('email', body.email)

      // Générer un code à 6 chiffres
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      
      // Expiration dans 30 minutes
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()

      // Sauvegarder le code
      const { error: insertError } = await supabase
        .from('password_reset_codes')
        .insert({
          email: body.email,
          code: code,
          expires_at: expiresAt
        })

      if (insertError) {
        console.error('Error saving reset code:', insertError)
        throw new Error('Erreur lors de la sauvegarde du code')
      }

      // Envoyer l'email via la fonction send-email-notifications
      const { error: emailError } = await supabase.functions.invoke('send-email-notifications', {
        body: {
          type: 'password_reset_code',
          to: body.email,
          data: {
            email: body.email,
            code: code,
            expires_in_minutes: 30
          }
        }
      })

      if (emailError) {
        console.error('Error sending email:', emailError)
        throw new Error('Erreur lors de l\'envoi de l\'email')
      }

      console.log('Reset code sent successfully for:', body.email)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Un code de vérification a été envoyé à votre adresse email.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (body.action === 'verify_and_reset') {
      console.log('Verifying reset code for email:', body.email)

      // Nettoyer les codes expirés
      await supabase.rpc('cleanup_expired_reset_codes')

      // Vérifier le code
      const { data: resetCodes, error: codeError } = await supabase
        .from('password_reset_codes')
        .select('*')
        .eq('email', body.email)
        .eq('code', body.code)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .limit(1)

      if (codeError) {
        console.error('Error checking reset code:', codeError)
        throw new Error('Erreur lors de la vérification du code')
      }

      if (!resetCodes || resetCodes.length === 0) {
        console.log('Invalid or expired code for email:', body.email)
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Code invalide ou expiré.' 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Trouver l'utilisateur
      const { data: users, error: userError } = await supabase.auth.admin.listUsers()
      if (userError) {
        console.error('Error finding user:', userError)
        throw new Error('Erreur lors de la recherche de l\'utilisateur')
      }

      const user = users.users.find(u => u.email === body.email)
      if (!user) {
        console.log('User not found for email:', body.email)
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Utilisateur non trouvé.' 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Réinitialiser le mot de passe
      const { error: resetError } = await supabase.auth.admin.updateUserById(user.id, {
        password: body.newPassword
      })

      if (resetError) {
        console.error('Error resetting password:', resetError)
        throw new Error('Erreur lors de la réinitialisation du mot de passe')
      }

      // Marquer le code comme utilisé
      await supabase
        .from('password_reset_codes')
        .update({ used: true })
        .eq('id', resetCodes[0].id)

      console.log('Password reset successfully for:', body.email)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Mot de passe réinitialisé avec succès.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: false, message: 'Action non reconnue.' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in password-reset-code function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || 'Une erreur est survenue.' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})