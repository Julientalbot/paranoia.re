import Image from "next/image";
import HeroDemo from "./components/HeroDemo";
import WaitlistForm from "./components/WaitlistForm";

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
  }
];

export default function HomePage() {
  const heroPreview = {
    before:
      "Peux-tu résumer ce contrat signé avec Acme Corp ? Client : Jean Dupont (CTO, jean.dupont@acme.com). SIRET 123 456 789 00012. Inclure la clause 4.2 sur la sortie anticipée et comparer à notre template interne 2024.",
    after:
      "Peux-tu résumer ce contrat signé avec [Client]. Client : [Prénom] [Nom] (CTO, [Email]). SIRET [SIRET]. Inclure la clause 4.2 sur la sortie anticipée et comparer à notre template interne 2024."
  };

  return (
    <main>
      <header>
        <a className="logo" href="/" aria-label="Accueil">
          <Image src="/logo_paranoia.png" alt="Paranoia logo" width={40} height={40} priority />
          <span>Paranoia</span>
        </a>
        <a className="header-cta" href="#cta">
          Beta privée en cours →
        </a>
      </header>
      <div className="container">

        <section className="hero">
          <div className="hero-copy">
            <span className="hero-eyebrow">Sécuriser ChatGPT en entreprise</span>
            <h1>Vos prompts restent en local.</h1>
            <p className="hero-sub">ChatGPT reçoit uniquement la version protégée : PII masquées, sens conservé.</p>
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
                <span>On exploite ChatGPT, on n&apos;essaie pas de le remplacer.</span>
              </div>
              <div className="bullet">
                <strong>Déjà en beta</strong>
                <span>Tests avec des équipes Légal, Produit, Support.</span>
              </div>
            </div>
            <div className="hero-cta">
              <a className="btn" href="#cta">
                Rejoindre la beta
              </a>
              <a className="btn secondary" href="#cta">
                Être tenu informé
              </a>
              <span className="mini">Email pro • Pas de spam • Ouverture par vagues</span>
            </div>
          </div>

          <HeroDemo before={heroPreview.before} after={heroPreview.after} />
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
            {faqs.slice(0, 3).map((item) => (
              <details key={item.question} open>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="section" id="cta">
          <div className="cta-block">
            <div className="section-header">
              <div>
                <h2>Beta privée</h2>
                <p className="muted">
                  On ouvre par vagues pour accompagner les équipes. Laisse ton email pro, on te recontacte vite.
                </p>
              </div>
              <div className="pill">Local-only • Pas de stockage cloud</div>
            </div>
            <WaitlistForm />
            <p className="hint">
              Transparence :{" "}
              <a className="inline-link" href="/rapports-incidents">
                rapports d&apos;incidents (Sentry)
              </a>
              .
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
