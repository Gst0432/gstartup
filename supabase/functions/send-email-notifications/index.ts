import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface EmailNotificationRequest {
  type: 'user_registration' | 'payment_success' | 'order_confirmation';
  to: string;
  data: any;
}

const ADMIN_EMAIL = "contact@gstartup.pro";
const DOMAIN_EMAIL = "227makemoney.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { type, to, data }: EmailNotificationRequest = await req.json();
    console.log(`Sending ${type} email to ${to}`);

    let emailContent;
    let subject;

    switch (type) {
      case 'user_registration':
        subject = "Nouvelle inscription sur 227makemoney.com";
        emailContent = generateRegistrationEmail(data);
        break;
      
      case 'payment_success':
        subject = "Paiement reçu - 227makemoney.com";
        emailContent = generatePaymentSuccessEmail(data);
        break;
      
      case 'order_confirmation':
        subject = "Confirmation de commande - 227makemoney.com";
        emailContent = generateOrderConfirmationEmail(data);
        break;
      
      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    const emailResponse = await resend.emails.send({
      from: `227makemoney.com <noreply@${DOMAIN_EMAIL}>`,
      to: [to],
      subject,
      html: emailContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, email_id: emailResponse.data?.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

function generateRegistrationEmail(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>227makemoney.com - Nouvelle inscription</h1>
      </div>
      <div class="content">
        <h2>Nouvel utilisateur inscrit</h2>
        <p><strong>Nom :</strong> ${data.display_name || 'Non spécifié'}</p>
        <p><strong>Email :</strong> ${data.email}</p>
        <p><strong>Rôle :</strong> ${data.role || 'customer'}</p>
        <p><strong>Date d'inscription :</strong> ${new Date().toLocaleString('fr-FR')}</p>
        ${data.phone ? `<p><strong>Téléphone :</strong> ${data.phone}</p>` : ''}
      </div>
      <div class="footer">
        <p>Cet email a été envoyé automatiquement par le système 227makemoney.com</p>
      </div>
    </body>
    </html>
  `;
}

function generatePaymentSuccessEmail(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #16a34a; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; }
        .amount { font-size: 24px; font-weight: bold; color: #16a34a; }
        .order-details { background: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>✅ Paiement reçu avec succès</h1>
      </div>
      <div class="content">
        <h2>Félicitations ! Vous avez reçu un paiement</h2>
        <div class="amount">${data.amount} ${data.currency || 'XAF'}</div>
        
        <div class="order-details">
          <h3>Détails de la commande</h3>
          <p><strong>Commande N° :</strong> ${data.order_number}</p>
          <p><strong>Client :</strong> ${data.customer_name}</p>
          <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
          <p><strong>Statut :</strong> Payé</p>
          ${data.payment_method ? `<p><strong>Méthode de paiement :</strong> ${data.payment_method}</p>` : ''}
        </div>

        <p>Le paiement a été traité avec succès. Vous pouvez maintenant procéder à la livraison/fourniture du service.</p>
      </div>
      <div class="footer">
        <p>227makemoney.com - Votre plateforme de commerce en ligne</p>
      </div>
    </body>
    </html>
  `;
}

function generateOrderConfirmationEmail(data: any): string {
  const itemsHtml = data.items?.map((item: any) => `
    <tr>
      <td>${item.product_name}</td>
      <td>${item.quantity}</td>
      <td>${item.price} ${data.currency || 'XAF'}</td>
      <td>${item.total} ${data.currency || 'XAF'}</td>
    </tr>
  `).join('') || '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; }
        .total { font-size: 20px; font-weight: bold; color: #2563eb; }
        .order-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .order-table th, .order-table td { padding: 10px; border: 1px solid #ddd; text-align: left; }
        .order-table th { background: #f3f4f6; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🛍️ Confirmation de commande</h1>
      </div>
      <div class="content">
        <h2>Merci pour votre commande !</h2>
        <p>Bonjour ${data.customer_name},</p>
        <p>Votre commande a été confirmée avec succès.</p>

        <h3>Détails de la commande</h3>
        <p><strong>Commande N° :</strong> ${data.order_number}</p>
        <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
        <p><strong>Statut :</strong> ${data.status === 'confirmed' ? 'Confirmée' : 'En cours'}</p>

        ${itemsHtml ? `
        <h3>Articles commandés</h3>
        <table class="order-table">
          <thead>
            <tr>
              <th>Article</th>
              <th>Quantité</th>
              <th>Prix unitaire</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        ` : ''}

        <div class="total">Total : ${data.total_amount} ${data.currency || 'XAF'}</div>

        <p>Nous traiterons votre commande dans les plus brefs délais. Vous recevrez une notification de suivi une fois que votre commande sera expédiée.</p>
        
        <p>Merci de votre confiance !</p>
      </div>
      <div class="footer">
        <p>227makemoney.com - Votre marketplace de confiance</p>
        <p>Si vous avez des questions, contactez-nous à contact@gstartup.pro</p>
      </div>
    </body>
    </html>
  `;
}