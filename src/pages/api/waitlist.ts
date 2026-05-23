import type { APIRoute } from 'astro';
import { sendWaitlistEmail, sendWaitlistNotification } from '../../lib/email';

export const prerender = false;

type Body = {
  email?: string;
};

const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

const json = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
  });

export const POST: APIRoute = async ({ request }) => {
  const { email = '' } = ((await request.json().catch(() => ({}))) as Body) || {};
  const normalized = email.trim().toLowerCase();

  if (!isValidEmail(normalized)) {
    return json({ error: 'Email invalide' }, 400);
  }

  try {
    await sendWaitlistNotification({ email: normalized, submittedAt: new Date().toJSON() });
  } catch (error) {
    console.error('Waitlist notification error', error);
    return json({ error: "Impossible d'enregistrer cet email pour le moment." }, 500);
  }

  sendWaitlistEmail({ to: normalized }).catch((sendError) => {
    console.error('Resend error', sendError);
  });

  return json({ ok: true });
};
