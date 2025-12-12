"use client";

import { FormEvent, useId, useState } from "react";

export default function WaitlistForm() {
  const inputId = useId();
  const hintId = useId();
  const statusId = useId();

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitted(false);
    setIsSubmitting(true);

    const normalized = email.trim();
    const isValidEmail = /\S+@\S+\.\S+/.test(normalized);

    if (!isValidEmail) {
      setError("Ajoute un email professionnel valide.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        setError(payload.error || "Impossible d'enregistrer cet email pour le moment.");
        return;
      }

      setSubmitted(true);
      setEmail("");
    } catch (submitError) {
      setError("Impossible d'enregistrer cet email pour le moment.");
      console.error(submitError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} aria-describedby={`${hintId} ${statusId}`}>
        <div className="field">
          <label htmlFor={inputId} className="sr-only">
            Email professionnel
          </label>
          <input
            id={inputId}
            type="email"
            name="email"
            placeholder="email@entreprise.com"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(error) || undefined}
          />
        </div>
        <button className="btn" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Envoi..." : "Rejoindre la beta"}
        </button>
      </form>
      <p className="hint" id={hintId}>
        Les emails sont stockés dans Supabase (table waitlist). Réponse sous 48h.
      </p>
      <div id={statusId}>
        {error && <div className="status error">{error}</div>}
        {submitted && !error && <div className="status success">Merci ! On revient vers toi très vite.</div>}
      </div>
    </>
  );
}

