import type { APIRoute } from 'astro';
import { sendWaitlistEmail, sendWaitlistNotification } from '../../lib/email';

export const prerender = false;

type Body = {
  email?: string;
  website?: string;
};

const MAX_BODY_BYTES = 4096;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type ReadSubmissionResult =
  | {
      ok: true;
      expectsJson: boolean;
      email: string;
      website: string;
    }
  | {
      ok: false;
      expectsJson: boolean;
      status: number;
      message: string;
    };

const rateLimit = new Map<string, RateLimitEntry>();

const isValidEmail = (email: string) => {
  if (!email || email.length > 254 || /\s/.test(email)) return false;

  const parts = email.split('@');
  if (parts.length !== 2) return false;

  const [local, domain] = parts;
  if (!local || !domain || local.length > 64) return false;
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local)) return false;

  const labels = domain.split('.');
  if (labels.length < 2) return false;

  return labels.every((label, index) => {
    if (!label || label.length > 63) return false;
    if (label.startsWith('-') || label.endsWith('-')) return false;
    if (!/^[a-z0-9-]+$/i.test(label)) return false;

    const isTld = index === labels.length - 1;
    return !isTld || /^[a-z]{2,}$/i.test(label);
  });
};

const noStoreHeaders = {
  'cache-control': 'no-store',
};

const json = (payload: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...noStoreHeaders,
      ...headers,
    },
  });

const html = (title: string, message: string, status = 200, headers: HeadersInit = {}) =>
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
      ...headers,
    },
  });

const getClientKey = (request: Request) => {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwardedFor || request.headers.get('x-real-ip') || 'unknown-client';
};

const consumeRateLimit = (key: string) => {
  const now = Date.now();
  const current = rateLimit.get(key);

  for (const [entryKey, entry] of rateLimit) {
    if (entry.resetAt <= now) {
      rateLimit.delete(entryKey);
    }
  }

  if (!current || current.resetAt <= now) {
    rateLimit.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  current.count += 1;
  rateLimit.set(key, current);

  return {
    allowed: current.count <= RATE_LIMIT_MAX_REQUESTS,
    retryAfter: Math.ceil((current.resetAt - now) / 1000),
  };
};

const isTooLarge = (value: string) => new TextEncoder().encode(value).length > MAX_BODY_BYTES;

const readSubmission = async (request: Request): Promise<ReadSubmissionResult> => {
  const contentType = request.headers.get('content-type') || '';
  const expectsJson = contentType.includes('application/json');
  const contentLength = Number(request.headers.get('content-length') || 0);

  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return {
      ok: false,
      expectsJson,
      status: 413,
      message: 'Requête trop volumineuse',
    };
  }

  if (contentType.includes('application/json')) {
    const raw = await request.text().catch(() => '');

    if (isTooLarge(raw)) {
      return {
        ok: false,
        expectsJson,
        status: 413,
        message: 'Requête trop volumineuse',
      };
    }

    try {
      const { email = '', website = '' } = (raw ? JSON.parse(raw) : {}) as Body;
      return {
        ok: true,
        expectsJson,
        email: String(email),
        website: String(website),
      };
    } catch {
      return {
        ok: false,
        expectsJson,
        status: 400,
        message: 'Payload JSON invalide',
      };
    }
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const raw = await request.text().catch(() => '');

    if (isTooLarge(raw)) {
      return {
        ok: false,
        expectsJson,
        status: 413,
        message: 'Requête trop volumineuse',
      };
    }

    const form = new URLSearchParams(raw);
    return {
      ok: true,
      expectsJson,
      email: form.get('email') || '',
      website: form.get('website') || '',
    };
  }

  const form = await request.formData().catch(() => null);
  return {
    ok: true,
    expectsJson,
    email: String(form?.get('email') || ''),
    website: String(form?.get('website') || ''),
  };
};

const safeError = (error: unknown) => {
  if (error instanceof Error) {
    return { name: error.name, message: error.message };
  }

  return { message: 'Unknown error' };
};

export const POST: APIRoute = async ({ request }) => {
  const clientKey = getClientKey(request);
  const quota = consumeRateLimit(clientKey);
  const retryHeaders = quota.retryAfter ? { 'retry-after': String(quota.retryAfter) } : {};

  if (!quota.allowed) {
    const message = 'Trop de demandes. Réessayez dans quelques minutes.';
    return request.headers.get('content-type')?.includes('application/json')
      ? json({ error: message }, 429, retryHeaders)
      : html('Trop de demandes', message, 429, retryHeaders);
  }

  const submission = await readSubmission(request);

  if (!submission.ok) {
    return submission.expectsJson
      ? json({ error: submission.message }, submission.status)
      : html('Demande invalide', submission.message, submission.status);
  }

  const { expectsJson, email, website } = submission;
  const normalized = email.trim().toLowerCase();

  if (website.trim()) {
    return expectsJson
      ? json({ ok: true })
      : html('Demande reçue', 'Votre email a été transmis. Réponse sous 48h.', 200);
  }

  if (!isValidEmail(normalized)) {
    return expectsJson
      ? json({ error: 'Email invalide' }, 400)
      : html('Email invalide', 'L’adresse saisie ne peut pas être enregistrée. Revenez au formulaire pour la corriger.', 400);
  }

  try {
    await sendWaitlistNotification({ email: normalized, submittedAt: new Date().toJSON() });
  } catch (error) {
    console.error('waitlist.notification_failed', safeError(error));
    return expectsJson
      ? json({ error: "Impossible d'enregistrer cet email pour le moment." }, 500)
      : html('Enregistrement impossible', "L'email ne peut pas être enregistré pour le moment. Réessayez depuis le formulaire.", 500);
  }

  sendWaitlistEmail({ to: normalized }).catch((sendError) => {
    console.error('waitlist.confirmation_failed', safeError(sendError));
  });

  return expectsJson
    ? json({ ok: true })
    : html('Demande reçue', 'Votre email a été transmis. Réponse sous 48h.', 200);
};
