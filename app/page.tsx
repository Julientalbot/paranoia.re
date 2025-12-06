"use client";

import { FormEvent, useMemo, useState } from "react";

type Card = {
  title: string;
  description: string;
  badge?: string;
};

type Step = {
  title: string;
  description: string;
  detail: string;
};

type FAQ = {
  question: string;
  answer: string;
};

const highlights: Card[] = [
  {
    title: "Local-only, zéro stockage",
    description:
      "Analyse des prompts directement sur le poste de l'utilisateur. Pas de serveur Paranoia, pas de copie, pas de risque latéral."
  },
  {
    title: "Protection intelligente",
    description:
      "Détection des PII et données sensibles, puis choix du bon traitement : anonymisation, pseudonymisation ou reformulation sans casser le contexte."
  },
  {
    title: "Pensé pour ChatGPT",
    description:
      "Nous n'essayons pas de concurrencer les LLM américains. On exploite leur puissance en ajoutant la couche conformité et contrôle dont l'entreprise a besoin."
  },
  {
    title: "Politiques gouvernables",
    description:
      "Console admin pour définir les règles, exemptions et logs locaux. Extension + proxy pour un déploiement rapide et pilotable."
  }
];

const steps: Step[] = [
  {
    title: "Détecte",
    description: "Repère PII, secrets internes, mentions contractuelles et données client.",
    detail: "Moteur de détection embarqué, ajustable par politique (mots-clés, patterns, exceptions)."
  },
  {
    title: "Protège",
    description: "Choisit le bon traitement pour préserver le sens sans exposer les données.",
    detail: "Anonymisation, pseudonymisation ou reformulation selon le type de contenu et l'usage."
  },
  {
    title: "Transmet",
    description: "Envoie à ChatGPT uniquement le prompt nettoyé.",
    detail: "Audit trail local, prompts originaux jamais stockés côté Paranoia."
  }
];

const surfaces: Card[] = [
  {
    title: "Extension",
    description: "UX immédiate côté utilisateur, sans friction. Activation par profil, politiques embarquées."
  },
  {
    title: "Proxy",
    description: "Contrôle des flux ChatGPT via un point de passage maîtrisé, pour les cas d'usage équipes."
  },
  {
    title: "Console admin",
    description: "Gestion des politiques de masquage, des exceptions métiers et du monitoring local-only."
  }
];

const faqs: FAQ[] = [
  {
    question: "Stockez-vous mes prompts ?",
    answer: "Non. Tout est traité localement sur le poste de l'utilisateur. Pas de serveur Paranoia, pas de base de données distante."
  },
  {
    question: "Qu'est-ce qui est envoyé à ChatGPT ?",
    answer: "Uniquement le prompt déjà nettoyé par Paranoia. Les éléments sensibles sont masqués ou reformulés."
  },
  {
    question: "Combien de temps pour déployer ?",
    answer: "Quelques minutes pour l'extension, et le proxy si besoin. Les politiques se gèrent depuis la console admin."
  },
  {
    question: "Qui peut rejoindre la beta privée ?",
    answer: "Priorité aux équipes Sécurité, IT, Juridique, Produit/Data qui ont un usage actif de ChatGPT."
  }
];

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const heroPreview = useMemo(
    () => ({
      before:
        "Peux-tu résumer ce contrat signé avec Acme Corp (contact : julie.dupont@acme.com, clause 4.2 sur la sortie anticipée) et comparer aux clauses de notre template interne 2024 ?",
      after:
        "Peux-tu résumer ce contrat signé avec [Client] (clause 4.2 sur la sortie anticipée) et comparer aux clauses de notre template interne 2024 ?"
    }),
    []
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitted(false);

    const normalized = email.trim();
    const isValidEmail = /\S+@\S+\.\S+/.test(normalized);

    if (!isValidEmail) {
      setError("Ajoute un email professionnel valide.");
      return;
    }

    // Stub pour la beta : branchement backend (Resend ou autre) à prévoir.
    setSubmitted(true);
  };

  return (
    <main>
      <div className="container">
        <header>
          <a className="logo" href="#">
            <span className="logo-mark">P</span>
            <span>Paranoia</span>
          </a>
          <a className="header-cta" href="#cta">
            Beta privée en cours →
          </a>
        </header>

        <section className="hero">
          <div className="hero-copy">
            <span className="hero-eyebrow">Sécuriser ChatGPT en entreprise</span>
            <h1>ChatGPT en entreprise, sans fuite.</h1>
            <p className="hero-sub">
              Paranoia détecte et protège les données sensibles dans vos prompts, localement, avant de les envoyer
              aux LLM américains. Anonymisation, pseudonymisation ou reformulation pour garder le sens intact.
            </p>
            <div className="hero-bullets">
              <div className="bullet">
                <strong>Local-only</strong>
                <span>Aucun serveur Paranoia, aucun stockage.</span>
              </div>
              <div className="bullet">
                <strong>Extension + proxy</strong>
                <span>Déploiement rapide, gouverné par console admin.</span>
              </div>
              <div className="bullet">
                <strong>LLM-friendly</strong>
                <span>On exploite ChatGPT, on n'essaie pas de le remplacer.</span>
              </div>
            </div>
            <div className="hero-cta">
              <a className="btn" href="#cta">
                Rejoindre la beta
              </a>
              <a className="btn secondary" href="#cta">
                Être tenu informé
              </a>
              <span className="mini">Ouverture par vagues. Réponse sous 48h.</span>
            </div>
          </div>

          <div className="hero-card">
            <div className="badge">Avant / après Paranoia</div>
            <div className="card-grid">
              <div className="card accent">
                <div className="tag">Prompt brut</div>
                <p>{heroPreview.before}</p>
              </div>
              <div className="card accent">
                <div className="tag">Prompt envoyé à ChatGPT</div>
                <p>{heroPreview.after}</p>
              </div>
            </div>
            <div className="list" style={{ marginTop: 12 }}>
              <div className="pill">Détection PII</div>
              <div className="pill">Anonymisation ciblée</div>
              <div className="pill">Cohérence sémantique préservée</div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2>Pourquoi Paranoia</h2>
            <span className="capsule">Beta privée en cours</span>
          </div>
          <div className="grid-3">
            {highlights.map((item) => (
              <div className="card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2>Comment ça marche</h2>
            <p className="muted">Détecte → protège → transmet. Le tout sur le poste, sans stockage.</p>
          </div>
          <div className="grid-3">
            {steps.map((step) => (
              <div className="card accent" key={step.title}>
                <div className="tag">{step.title}</div>
                <h3>{step.description}</h3>
                <p>{step.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2>Surfaces produit</h2>
            <p className="muted">Extension pour l'usage individuel, proxy pour les flux, console pour gouverner.</p>
          </div>
          <div className="grid-3">
            {surfaces.map((surface) => (
              <div className="card" key={surface.title}>
                <h3>{surface.title}</h3>
                <p>{surface.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2>FAQ express</h2>
            <p className="muted">Rassurer Sécurité, IT et Juridique dès la première visite.</p>
          </div>
          <div className="faq">
            {faqs.map((item) => (
              <div className="faq-item" key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section" id="cta">
          <div className="cta-block">
            <div className="section-header">
              <div>
                <h2>Beta privée</h2>
                <p className="muted">
                  On ouvre par vagues pour accompagner les équipes. Laisse ton email, on te recontacte vite.
                </p>
              </div>
              <div className="pill">Local-only • Pas de stockage</div>
            </div>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                placeholder="email@entreprise.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-label="Email professionnel"
              />
              <button className="btn" type="submit">
                Rejoindre la beta
              </button>
            </form>
            <p className="hint">Formulaire minimal. Backend (Resend ou autre) à brancher plus tard.</p>
            {error && <div className="status error">{error}</div>}
            {submitted && !error && <div className="status success">Merci ! On revient vers toi très vite.</div>}
          </div>
        </section>
      </div>
    </main>
  );
}
