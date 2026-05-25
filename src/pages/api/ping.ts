import type { APIRoute } from 'astro';
import { isEmailConfigured } from '../../lib/email';

export const prerender = false;

const json = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
  });

export const GET: APIRoute = async () => {
  if (!isEmailConfigured()) {
    return json({ ok: false, error: 'Configuration email manquante' }, 500);
  }

  return json({
    ok: true,
    backend: 'email',
    waitlist: {
      version: 2,
      bodyLimit: true,
      emailValidation: true,
      honeypot: true,
      rateLimit: true,
    },
  });
};
