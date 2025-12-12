import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  // eslint-disable-next-line no-console
  console.warn("RESEND_API_KEY is not set. Emails will not be sent.");
}

export const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

type SendWaitlistEmailParams = {
  to: string;
};

export async function sendWaitlistEmail({ to }: SendWaitlistEmailParams) {
  if (!resend) return;

  const subject = "Paranoia — On vous recontacte pour la beta privée";

  const html = `
    <div style="font-family: Arial, sans-serif; color: #0a0f1f; line-height: 1.5;">
      <h2 style="margin: 0 0 12px;">Merci pour votre intérêt !</h2>
      <p style="margin: 0 0 12px;">Votre email est bien enregistré pour la beta privée de Paranoia.</p>
      <p style="margin: 0 0 12px;">Paranoia protège vos prompts localement avant ChatGPT : pas de serveur, pas de stockage cloud.</p>
      <p style="margin: 0 0 12px;">Nous revenons vers vous sous peu pour l'onboarding.</p>
      <p style="margin: 0 0 12px;">— L'équipe Paranoia</p>
    </div>
  `;

  await resend.emails.send({
    from: "Paranoia <beta@paranoia.re>",
    to,
    subject,
    html
  });
}
