/**
 * Vercel Function — Paranoia contact form → Resend.
 * No npm deps: native fetch only.
 *
 * Expected JSON body:
 * {
 *   "variant": "pilote",
 *   "email": "visitor@example.com",
 *   "fields": { "champ1": "...", "champ2": "...", "champ3": "..." },
 *   "page": "/pilote",
 *   "website": ""  // honeypot — must be empty
 * }
 */

const VARIANTS = new Set(['pilote']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL = 254;
const MAX_FIELD = 2000;
const MAX_PAGE = 200;

const FIELD_LABELS = {
  pilote: {
    champ1: 'Assistant / flux',
    champ2: 'Ce qui risque de partir dans le prompt',
    champ3: 'Contrainte (politique, client, secteur)',
  },
};

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function clip(value, max) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok: false, error: 'method_not_allowed' });
  }

  let body;
  try {
    body = await readBody(req);
  } catch {
    return json(res, 400, { ok: false, error: 'invalid_json' });
  }

  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return json(res, 200, { ok: true });
  }

  const variant = clip(body.variant, 40);
  const email = clip(body.email, MAX_EMAIL);
  const page = clip(body.page, MAX_PAGE) || '/';
  const fields = body.fields && typeof body.fields === 'object' ? body.fields : {};

  if (!VARIANTS.has(variant)) {
    return json(res, 400, { ok: false, error: 'invalid_variant' });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return json(res, 400, { ok: false, error: 'invalid_email' });
  }

  const champ1 = clip(fields.champ1, MAX_FIELD);
  const champ2 = clip(fields.champ2, MAX_FIELD);
  const champ3 = clip(fields.champ3, MAX_FIELD);

  if (!champ1 || !champ2 || !champ3) {
    return json(res, 400, { ok: false, error: 'missing_fields' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return json(res, 502, { ok: false, error: 'mail_not_configured' });
  }

  const labels = FIELD_LABELS[variant];
  const text = [
    `Variant: ${variant}`,
    `Page: ${page}`,
    `Email: ${email}`,
    '',
    `${labels.champ1}:`,
    champ1,
    '',
    `${labels.champ2}:`,
    champ2,
    '',
    `${labels.champ3}:`,
    champ3,
  ].join('\n');

  const payload = {
    from: 'Paranoia — site <site@send.paranoia.re>',
    to: ['contact@paranoia.re', 'julien.talbot@ergonomia.re'],
    reply_to: email,
    subject: `[Paranoia] ${variant} — ${page}`,
    text,
  };

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!resendRes.ok) {
      return json(res, 502, { ok: false, error: 'mail_send_failed' });
    }

    return json(res, 200, { ok: true });
  } catch {
    return json(res, 502, { ok: false, error: 'mail_send_failed' });
  }
}
