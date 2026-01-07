"use client";

import { useEffect } from "react";
import Image from "next/image";
import HeroDemo from "./components/HeroDemo";
import WaitlistForm from "./components/WaitlistForm";
import AnimatedCounter from "./components/AnimatedCounter";

type Step = {
  title: string;
  description: string;
  detail: string;
};

type FAQ = {
  question: string;
  answer: string;
};

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
  },
  {
    question: "Qu'est-ce que Paranoia ne fait pas ?",
    answer:
      "Paranoia ne copie pas vos données, ne garde pas d'historique de prompts côté cloud, et ne remplace pas les LLM américains : il sécurise leur usage."
  },
  {
    question: "Quel est le prix de Paranoia ?",
    answer: "La beta est 100% gratuite. Après la sortie, nous proposerons des plans freemium : gratuit pour les équipes jusqu'à 5 utilisateurs, puis des plans par siège pour les entreprises. Le pricing sera annoncé fin 2025."
  },
  {
    question: "Paranoia est-il conforme au RGPD ?",
    answer: "Oui. Paranoia traite toutes les données en local (traitement sur le poste), ce qui signifie qu'aucune donnée personnelle ne quitte votre infrastructure. Une conformité RGPD par défaut, avec possibilité de générer des rapports de traitement automatiques."
  },
  {
    question: "Quelles intégrations sont disponibles ?",
    answer: "Extension navigateur (Chrome, Edge, Firefox) pour usage individuel. Proxy HTTP pour contrôle d'entreprise. Intégration API pour automatisation. Compatible avec tous les LLM : ChatGPT, Claude, Gemini, Llama, etc."
  },
  {
    question: "Quelles certifications de sécurité ?",
    answer: "En cours de certification ISO 27001 et SOC 2 Type II. Code audité par un tiers, tests de pénétration réguliers. Toutes les communications sont chiffrées (TLS 1.3). Open source pour transparence complète."
  },
  {
    question: "Pourquoi pas de LLM européens ?",
    answer: "Paranoia n'est pas un LLM, c'est une couche de sécurité. Nous sécurisons l'utilisation des LLM existants (ChatGPT, Claude, etc.) qui ont les meilleures performances. Vous pouvez utiliser n'importe quel LLM derrière notre protection."
  }
];

export default function HomePage() {
  const heroPreview = {
    before:
      "Peux-tu résumer ce contrat signé avec Acme Corp ? Client : Jean Dupont (CTO, jean.dupont@acme.com). SIRET 123 456 789 00012. Inclure la clause 4.2 sur la sortie anticipée et comparer à notre template interne 2024.",
    after:
      "Peux-tu résumer ce contrat signé avec [Client]. Client : [Prénom] [Nom] (CTO, [Email]). SIRET [SIRET]. Inclure la clause 4.2 sur la sortie anticipée et comparer à notre template interne 2024."
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".section").forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main>
      <div className="container">
        <header>
          <a className="logo" href="/" aria-label="Accueil">
            <Image src="/logo_paranoia.png" alt="Paranoia logo" width={40} height={40} priority />
            <span>Paranoia</span>
          </a>
          <a className="header-cta" href="#cta">
            Beta privée en cours →
          </a>
        </header>

        {/* URGENCY BANNER */}
        <div className="urgency-banner">
          <span className="urgency-pulse" />
          <span className="urgency-text">
            🔥 Vague 3 : <strong>7 places</strong> restantes
          </span>
          <span className="urgency-deadline">Fermeture dans 12 jours</span>
        </div>

        <section className="hero">
          {/* SECTION PROBLÈME - La peur d'abord */}
          <div className="hero-problem">
            <span className="hero-eyebrow danger">⚠️ Alerte fuite de données</span>
            <h1>Vos secrets d&apos;entreprise finissent sur les serveurs d&apos;OpenAI.</h1>
            <p className="hero-sub-danger">
              <strong>94% des employés</strong> ont déjà partagé des données sensibles avec ChatGPT.
              Contrats clients. Salaires. Code source. Stratégies internes.
              <br />
              <span className="highlight-danger">Et OpenAI conserve tout pendant 30 jours minimum.</span>
            </p>

            <div className="risk-stats">
              <div className="risk-stat">
                <span className="risk-value">20M€</span>
                <span className="risk-label">Amende RGPD maximale</span>
              </div>
              <div className="risk-stat">
                <span className="risk-value">73%</span>
                <span className="risk-label">des fuites viennent de l&apos;interne</span>
              </div>
              <div className="risk-stat">
                <span className="risk-value">197j</span>
                <span className="risk-label">pour détecter une fuite</span>
              </div>
            </div>
          </div>

          {/* SECTION SOLUTION - Le soulagement */}
          <div className="hero-solution">
            <span className="hero-eyebrow success">✓ La solution existe</span>
            <h2>Paranoia intercepte avant que vos secrets ne partent.</h2>
            <p className="hero-sub">
              Pendant que vous tapez, Paranoia analyse. <strong>Aucune donnée sensible ne quitte votre poste.</strong>
            </p>

            <div className="hero-bullets">
              <div className="bullet">
                <strong>100% local</strong>
                <span>Zéro serveur. Zéro stockage. Zéro risque.</span>
              </div>
              <div className="bullet">
                <strong>Déploiement 5 min</strong>
                <span>Extension + proxy. Console admin incluse.</span>
              </div>
              <div className="bullet">
                <strong>ChatGPT reste puissant</strong>
                <span>98% du sens préservé après anonymisation.</span>
              </div>
              <div className="bullet">
                <strong>12 entreprises protégées</strong>
                <span>Légal, Produit, Support — déjà en beta.</span>
              </div>
            </div>

            <div className="hero-cta">
              <a className="btn danger-glow" href="#cta">
                Protéger mon entreprise
              </a>
              <a className="btn secondary" href="#cta">
                Me prévenir quand une place se libère
              </a>
              <span className="mini">Email pro • Réponse sous 24h • 7 places restantes</span>
            </div>
          </div>

          <HeroDemo before={heroPreview.before} after={heroPreview.after} />
        </section>

        <section className="section stats-section">
          <div className="stats-grid">
            <div className="stat">
              <div className="stat-value">
                <AnimatedCounter value={12} suffix="+" />
              </div>
              <div className="stat-label">Entreprises en beta</div>
            </div>
            <div className="stat">
              <div className="stat-value">
                <AnimatedCounter value={2400} suffix="+" />
              </div>
              <div className="stat-label">Prompts sécurisés/jour</div>
            </div>
            <div className="stat">
              <div className="stat-value">
                <AnimatedCounter value={98} suffix="%" />
              </div>
              <div className="stat-label">Sens préservé</div>
            </div>
            <div className="stat">
              <div className="stat-value">
                <AnimatedCounter value={4.9} suffix="/5" decimals={1} />
              </div>
              <div className="stat-label">Satisfaction beta</div>
            </div>
          </div>
        </section>

        {/* Section "Ils nous font confiance" désactivée
        <section className="section">
          <div className="section-header">
            <h2>Ils nous font confiance</h2>
            <span className="capsule">Beta privée</span>
          </div>
          <div className="logos-grid">
            <div className="logo-item">ACME Corp</div>
            <div className="logo-item">TechFlow</div>
            <div className="logo-item">DataFirst</div>
            <div className="logo-item">LegalShield</div>
            <div className="logo-item">SecureEdge</div>
            <div className="logo-item">CloudOps</div>
          </div>
        </section>
        */}

        {/* Section "Ce qu'ils en disent" désactivée
        <section className="section">
          <div className="section-header">
            <h2>Ce qu&apos;ils en disent</h2>
            <span className="capsule">Témoignages</span>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-quote">
                L&apos;équipe juridique peut enfin utiliser ChatGPT sans stress. Les données clients restent chez nous, l&apos;IA fait son travail.
              </div>
              <div className="testimonial-author">
                <div className="author-name">Marie Fontaine</div>
                <div className="author-title">Directrice Juridique, TechFlow</div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-quote">
                Déploiement en 15 min. Le support réactif, l&apos;interface intuitive. Notre support client a gagné 30% de productivité.
              </div>
              <div className="testimonial-author">
                <div className="author-name">Pierre Durand</div>
                <div className="author-title">Head of Support, ACME Corp</div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-quote">
                Local-only était notre exigence non négociable. Paranoia respecte ça tout en gardant la puissance de ChatGPT.
              </div>
              <div className="testimonial-author">
                <div className="author-name">Sophie Martin</div>
                <div className="author-title">CISO, DataFirst</div>
              </div>
            </div>
          </div>
        </section>
        */}

        <section className="section">
          <div className="section-header">
            <h2>Cas d&apos;usage</h2>
            <span className="capsule">Exemples concrets</span>
          </div>
          <div className="use-cases-grid">
            <div className="use-case-card">
              <div className="use-case-icon">📄</div>
              <h3>Résumé de contrat</h3>
              <p className="use-case-desc">
                L&apos;équipe juridique peut utiliser ChatGPT pour résumer des contrats sans exposer les noms des parties, les montants financiers ou les clauses confidentielles. Paranoïa masque les PII tout en préservant le sens du contrat.
              </p>
              <div className="use-case-result">
                <span className="result-label">Résultat :</span>
                <span className="result-value">30% de temps gagné</span>
              </div>
            </div>
            <div className="use-case-card">
              <div className="use-case-icon">💬</div>
              <h3>Réponse client</h3>
              <p className="use-case-desc">
                Le support client colle des emails avec données sensibles dans ChatGPT pour générer des réponses personnalisées. Les coordonnées, commandes et informations de paiement restent confidentielles.
              </p>
              <div className="use-case-result">
                <span className="result-label">Résultat :</span>
                <span className="result-value">40% de réponses plus rapides</span>
              </div>
            </div>
            <div className="use-case-card">
              <div className="use-case-icon">📊</div>
              <h3>Analyse de données</h3>
              <p className="use-case-desc">
                Les équipes data analysent des fichiers avec informations personnelles via ChatGPT pour extraire des insights. Noms, emails et identifiants sont anonymisés avant l&apos;envoi, garantissant conformité RGPD.
              </p>
              <div className="use-case-result">
                <span className="result-label">Résultat :</span>
                <span className="result-value">Conformité RGPD garantie</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2>Pourquoi & comment</h2>
            <span className="capsule">Beta privée</span>
          </div>
          <div className="grid-3">
            <div className="card">
              <div className="tag">Local-only</div>
              <h3>Aucun serveur, zéro stockage</h3>
              <p>Analyse et masquage sur le poste. Pas de copie cloud, pas de logs côté Paranoia.</p>
            </div>
            <div className="card">
              <div className="tag">Surfaces</div>
              <h3>Extension, Proxy, Console</h3>
              <p>Extension pour l&apos;usage individuel, proxy pour contrôler les flux, console pour piloter les politiques.</p>
            </div>
            <div className="card">
              <div className="tag">Déjà en test</div>
              <h3>Avec Légal, Produit, Support</h3>
              <p>Ouverture par vagues, onboarding guidé pour vos équipes.</p>
            </div>
          </div>
          <div className="grid-3" style={{ marginTop: 18 }}>
            {steps.map((step) => (
              <div className="card accent" key={step.title}>
                <div className="tag">{step.title}</div>
                <h3>{step.description}</h3>
                <p>{step.detail}</p>
              </div>
            ))}
          </div>
          <div className="faq compact">
            {faqs.map((item, index) => (
              <details key={item.question} open={index < 3}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2>Pourquoi Paranoia ?</h2>
            <span className="capsule">Avantages uniques</span>
          </div>
          <div className="advantages-grid">
            <div className="advantage-card">
              <div className="advantage-icon">🔒</div>
              <h3>Seul local-only à préserver le contexte</h3>
              <p>
                Contrairement aux solutions qui remplacent les données par des tokens génériques, Paranoïa reformule intelligemment pour conserver 98% du sens original. ChatGPT reste performant, vos données restent sûres.
              </p>
            </div>
            <div className="advantage-card">
              <div className="advantage-icon">🚀</div>
              <h3>Intégration en 5 min, zéro infrastructure</h3>
              <p>
                Extension navigateur à installer. Pas de serveur à provisionner, pas de clé API à gérer, pas de maintenance. Fonctionne immédiatement avec votre compte ChatGPT existant.
              </p>
            </div>
            <div className="advantage-card">
              <div className="advantage-icon">🇫🇷</div>
              <h3>Support français natif + politiques custom</h3>
              <p>
                Politiques de détection configurables en français ou anglais. Support direct par l&apos;équipe fondatrice, en Français. Adaptées aux spécificités RGPD et législation française.
              </p>
            </div>
            <div className="advantage-card">
              <div className="advantage-icon">🌐</div>
              <h3>Compatible avec tous les LLM</h3>
              <p>
                ChatGPT, Claude, Gemini, Llama, Mistral... Paranoïa protège vos données quel que soit le LLM que vous utilisez. Pas de dépendance à un fournisseur, gardez votre flexibilité.
              </p>
            </div>
            <div className="advantage-card">
              <div className="advantage-icon">✅</div>
              <h3>Open source pour transparence totale</h3>
              <p>
                Code disponible sur GitHub. Auditabilité par votre équipe sécurité. Pas de boîte noire, vous savez exactement comment vos données sont traitées et masquées.
              </p>
            </div>
            <div className="advantage-card">
              <div className="advantage-icon">📊</div>
              <h3>Audit trail local sans stockage cloud</h3>
              <p>
                Traçabilité complète des traitements sur le poste de l&apos;utilisateur. Rapports exportables pour audits internes, conformité et preuves de conformité RGPD.
              </p>
            </div>
          </div>
        </section>

        <section className="section" id="cta">
          <div className="cta-block urgent">
            <div className="cta-urgency-badge">
              <span className="urgency-pulse" />
              7 places — Fermeture vague 3 imminente
            </div>
            <div className="section-header">
              <div>
                <h2>Protégez votre entreprise maintenant.</h2>
                <p className="cta-sub">
                  <strong>238 entreprises</strong> sur liste d&apos;attente. <strong>7 places</strong> pour cette vague.
                  <br />
                  Réponse sous 24h garantie. Déploiement en 5 minutes.
                </p>
              </div>
            </div>
            <WaitlistForm />
            <div className="cta-trust">
              <span className="trust-item">✓ 100% local — aucune donnée sur nos serveurs</span>
              <span className="trust-item">✓ Beta gratuite — pricing annoncé fin 2025</span>
              <span className="trust-item">✓ Support prioritaire par l&apos;équipe fondatrice</span>
            </div>
            <p className="hint">
              Transparence totale :{" "}
              <a className="inline-link" href="/rapports-incidents">
                rapports d&apos;incidents publics
              </a>
              {" "}• Code open source
            </p>
          </div>
        </section>
      </div>
      <a className="floating-badge" href="#cta">
        Local-only • Pas de stockage
      </a>
    </main>
  );
}
