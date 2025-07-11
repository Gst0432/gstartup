import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface EmailNotificationRequest {
  type: 'user_registration' | 'payment_success' | 'order_confirmation' | 'digital_product_delivery';
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
      
      case 'digital_product_delivery':
        subject = "Vos produits numériques sont prêts ! - 227makemoney.com";
        emailContent = generateDigitalProductDeliveryEmail(data);
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

function generateDigitalProductDeliveryEmail(data: any): string {
  const productsHtml = data.products?.map((product: any) => `
    <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #2563eb;">
      <h4 style="margin: 0 0 10px 0; color: #1f2937;">${product.name}</h4>
      <a href="${product.downloadUrl}" 
         style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;"
         target="_blank">
        📥 Télécharger maintenant
      </a>
    </div>
  `).join('') || '';

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
        .download-section { background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .alert { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎉 Vos produits numériques sont prêts !</h1>
      </div>
      <div class="content">
        <h2>Bonjour ${data.customer_name},</h2>
        <p>Excellente nouvelle ! Votre paiement pour la commande <strong>${data.order_number}</strong> a été confirmé et vos produits numériques sont maintenant disponibles au téléchargement.</p>

        <div class="download-section">
          <h3>🔽 Vos téléchargements</h3>
          ${productsHtml}
        </div>

        <div class="alert">
          <strong>⚠️ Important :</strong>
          <ul style="margin: 10px 0;">
            <li>Ces liens de téléchargement sont personnels et ne doivent pas être partagés</li>
            <li>Nous vous recommandons de télécharger vos fichiers immédiatement</li>
            <li>Conservez ces fichiers en lieu sûr sur votre ordinateur</li>
          </ul>
        </div>

        <p>Si vous rencontrez des problèmes avec les téléchargements ou si vous avez des questions sur vos produits, n'hésitez pas à nous contacter.</p>
        
        <p>Merci pour votre achat et votre confiance !</p>
        
        <p style="margin-top: 30px;">
          <strong>L'équipe 227makemoney.com</strong>
        </p>
      </div>
      <div class="footer">
        <p>227makemoney.com - Votre marketplace de produits numériques de confiance</p>
        <p>Support client : contact@gstartup.pro</p>
        <p style="color: #6b7280; font-size: 11px; margin-top: 10px;">
          Commande ${data.order_number} • ${new Date().toLocaleString('fr-FR')}
        </p>
      </div>
    </body>
    </html>
  `;
}