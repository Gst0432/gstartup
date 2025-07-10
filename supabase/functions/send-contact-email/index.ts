import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  type: 'devis' | 'installation' | 'contact';
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  budget?: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, name, email, phone, company, service, budget, message }: ContactEmailRequest = await req.json();

    // Email content based on type
    let subject = "";
    let htmlContent = "";

    switch (type) {
      case 'devis':
        subject = `Demande de devis - ${service || 'Service non spécifié'}`;
        htmlContent = `
          <h2>Nouvelle demande de devis</h2>
          <p><strong>Nom :</strong> ${name}</p>
          <p><strong>Email :</strong> ${email}</p>
          ${phone ? `<p><strong>Téléphone :</strong> ${phone}</p>` : ''}
          ${company ? `<p><strong>Entreprise :</strong> ${company}</p>` : ''}
          <p><strong>Service :</strong> ${service || 'Non spécifié'}</p>
          ${budget ? `<p><strong>Budget :</strong> ${budget}</p>` : ''}
          <p><strong>Message :</strong></p>
          <p>${message}</p>
        `;
        break;
        
      case 'installation':
        subject = `Commande d'installation - ${service || 'Service d\'installation'}`;
        htmlContent = `
          <h2>Nouvelle commande d'installation</h2>
          <p><strong>Nom :</strong> ${name}</p>
          <p><strong>Email :</strong> ${email}</p>
          ${phone ? `<p><strong>Téléphone :</strong> ${phone}</p>` : ''}
          ${company ? `<p><strong>Entreprise :</strong> ${company}</p>` : ''}
          <p><strong>Type d'installation :</strong> ${service || 'Non spécifié'}</p>
          <p><strong>Message/Détails :</strong></p>
          <p>${message}</p>
        `;
        break;
        
      default:
        subject = `Nouveau contact depuis le site - ${name}`;
        htmlContent = `
          <h2>Nouveau message de contact</h2>
          <p><strong>Nom :</strong> ${name}</p>
          <p><strong>Email :</strong> ${email}</p>
          ${phone ? `<p><strong>Téléphone :</strong> ${phone}</p>` : ''}
          ${company ? `<p><strong>Entreprise :</strong> ${company}</p>` : ''}
          <p><strong>Message :</strong></p>
          <p>${message}</p>
        `;
    }

    // Send email to admin
    const emailResponse = await resend.emails.send({
      from: "227makemoney.com <noreply@227makemoney.com>",
      to: ["contact@gstartup.pro"],
      subject: subject,
      html: `
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
            <h1>227makemoney.com</h1>
          </div>
          <div class="content">
            ${htmlContent}
          </div>
          <div class="footer">
            <p>Email reçu via le formulaire de contact du site 227makemoney.com</p>
            <p>Date : ${new Date().toLocaleString('fr-FR')}</p>
          </div>
        </body>
        </html>
      `,
    });

    // Send confirmation email to user
    await resend.emails.send({
      from: "227makemoney.com <noreply@227makemoney.com>",
      to: [email],
      subject: "Confirmation de réception - 227makemoney.com",
      html: `
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
            <h1>227makemoney.com</h1>
          </div>
          <div class="content">
            <h2>Merci pour votre message !</h2>
            <p>Bonjour ${name},</p>
            <p>Nous avons bien reçu votre demande et vous remercions de votre intérêt pour nos services.</p>
            <p>Notre équipe va examiner votre demande et vous recontactera dans les plus brefs délais.</p>
            <p>À très bientôt !</p>
            <p><strong>L'équipe 227makemoney.com</strong></p>
          </div>
          <div class="footer">
            <p>227makemoney.com - La marketplace de référence au Sénégal</p>
            <p>Contact : contact@gstartup.pro</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Emails sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Votre message a été envoyé avec succès. Nous vous recontacterons bientôt !"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer." 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);