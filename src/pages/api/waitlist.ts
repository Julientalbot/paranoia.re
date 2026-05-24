import type { APIRoute } from 'astro';
import { sendWaitlistEmail, sendWaitlistNotification } from '../../lib/email';

export const prerender = false;

type Body = {
  email?: string;
};

const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

const noStoreHeaders = {
  'cache-control': 'no-store',
};

const json = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...noStoreHeaders,
    },
  });

const html = (title: string, message: string, status = 200) =>
  new Response(`<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>${title} | Paranoia</title>
    <style>
      :root { color-scheme: light dark; font-family: system-ui, sans-serif; }
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; background: Canvas; color: CanvasText; }
      main { width: min(100%, 560px); }
      h1 { margin: 0 0 12px; font-size: clamp(1.8rem, 6vw, 3rem); line-height: 0.95; }
      p { margin: 0 0 24px; line-height: 1.5; color: color-mix(in srgb, CanvasText 72%, transparent); }
      a { color: inherit; text-underline-offset: 0.18em; }
    </style>
  </head>
  <body>
    <main>
      <h1>${title}</h1>
      <p>${message}</p>
      <a href="/#cta">Retour au formulaire</a>
    </main>
  </body>
</html>`, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      ...noStoreHeaders,
    },
  });

const readEmail = async (request: Request) => {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const { email = '' } = ((await request.json().catch(() => ({}))) as Body) || {};
    return email;
  }

  const form = await request.formData().catch(() => null);
  return String(form?.get('email') || '');
};

export const POST: APIRoute = async ({ request }) => {
  const contentType = request.headers.get('content-type') || '';
  const expectsJson = contentType.includes('application/json');
  const email = await readEmail(request);
  const normalized = email.trim().toLowerCase();

  if (!isValidEmail(normalized)) {
    return expectsJson
      ? json({ error: 'Email invalide' }, 400)
      : html('Email invalide', 'L’adresse saisie ne peut pas être enregistrée. Revenez au formulaire pour la corriger.', 400);
  }

  try {
    await sendWaitlistNotification({ email: normalized, submittedAt: new Date().toJSON() });
  } catch (error) {
    console.error('Waitlist notification error', error);
    return expectsJson
      ? json({ error: "Impossible d'enregistrer cet email pour le moment." }, 500)
      : html('Enregistrement impossible', "L'email ne peut pas être enregistré pour le moment. Réessayez depuis le formulaire.", 500);
  }

  sendWaitlistEmail({ to: normalized }).catch((sendError) => {
    console.error('Resend error', sendError);
  });

  return expectsJson
    ? json({ ok: true })
    : html('Demande reçue', 'Votre email a été transmis. Réponse sous 48h.', 200);
};
