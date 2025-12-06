import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendWaitlistEmail } from "@/app/lib/email";

export const runtime = "nodejs";

type Body = {
  email?: string;
};

const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

export async function POST(request: Request) {
  const { email = "" } = ((await request.json().catch(() => ({}))) as Body) || {};
  const normalized = email.trim().toLowerCase();

  if (!isValidEmail(normalized)) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: "Configuration Supabase manquante" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { error } = await supabase.from("waitlist").insert({ email: normalized });

  if (error) {
    // 23505 => violation de contrainte unique (email déjà enregistré)
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, message: "Déjà inscrit" });
    }
    console.error("Supabase insert error", error);
    return NextResponse.json({ error: "Impossible d'enregistrer cet email pour le moment." }, { status: 500 });
  }

  // Envoi email de bienvenue (non bloquant)
  sendWaitlistEmail({ to: normalized }).catch((sendError) => {
    console.error("Resend error", sendError);
  });

  return NextResponse.json({ ok: true });
}
