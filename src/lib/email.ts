import { Resend } from 'resend';
import { PARANOIA_CONTACT_EMAIL } from './contact';

const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim();

export const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export const WAITLIST_NOTIFY_TO = process.env.WAITLIST_NOTIFY_TO?.trim() || PARANOIA_CONTACT_EMAIL;

type SendWaitlistEmailParams = {
  to: string;
};

type SendWaitlistNotificationParams = {
  email: string;
  submittedAt: string;
  to?: string;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const isEmailConfigured = () => Boolean(resend && WAITLIST_NOTIFY_TO);

export async function sendWaitlistNotification({
  email,
  submittedAt,
  to = WAITLIST_NOTIFY_TO,
}: SendWaitlistNotificationParams) {
  if (!resend) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  if (!to) {
    throw new Error('WAITLIST_NOTIFY_TO is not configured');
  }

  const subject = '[Paranoia] Nouvelle demande beta';

  const html = `
    <div style="font-family: Arial, sans-serif; color: #0a0f1f; line-height: 1.5;">
      <h2 style="margin: 0 0 12px;">Nouvelle demande beta Paranoia.</h2>
      <p style="margin: 0 0 12px;"><strong>Email :</strong> ${escapeHtml(email)}</p>
      <p style="margin: 0 0 12px;"><strong>Reçu le :</strong> ${escapeHtml(submittedAt)}</p>
      <p style="margin: 0 0 12px;">Ce message sert de trace temporaire pour la demande waitlist.</p>
    </div>
  `;

  await resend.emails.send({
    from: `Paranoia <${PARANOIA_CONTACT_EMAIL}>`,
    to,
    subject,
    html,
  });
}

export async function sendWaitlistEmail({ to }: SendWaitlistEmailParams) {
  if (!resend) return;

  const subject = 'Paranoia - On vous recontacte pour la beta privée';

  const html = `
    <div style="font-family: Arial, sans-serif; color: #0a0f1f; line-height: 1.5;">
      <h2 style="margin: 0 0 12px;">Merci pour votre intérêt.</h2>
      <p style="margin: 0 0 12px;">Votre email est bien enregistré pour la beta privée de Paranoia.</p>
      <p style="margin: 0 0 12px;">Paranoia aide à réduire l'exposition des données sensibles dans les prompts avant l'usage d'un assistant IA.</p>
      <p style="margin: 0 0 12px;">Nous revenons vers vous sous peu pour cadrer le cas d'usage.</p>
      <p style="margin: 0 0 12px;">L'équipe Paranoia</p>
    </div>
  `;

  await resend.emails.send({
    from: `Paranoia <${PARANOIA_CONTACT_EMAIL}>`,
    to,
    subject,
    html,
  });
}
