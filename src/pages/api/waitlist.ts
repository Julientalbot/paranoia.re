import { createClient } from '@supabase/supabase-js';
import type { APIRoute } from 'astro';
import { sendWaitlistEmail } from '../../lib/email';

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

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return json({ error: 'Configuration Supabase manquante' }, 500);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await supabase.from('waitlist').insert({ email: normalized });

  if (error) {
    if (error.code === '23505') {
      return json({ ok: true, duplicate: true });
    }

    console.error('Supabase insert error', error);
    return json({ error: "Impossible d'enregistrer cet email pour le moment." }, 500);
  }

  sendWaitlistEmail({ to: normalized }).catch((sendError) => {
    console.error('Resend error', sendError);
  });

  return json({ ok: true });
};
