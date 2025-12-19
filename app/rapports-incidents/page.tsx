import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Rapports d'incidents (Sentry) — Paranoia",
  description:
    "Transparence sur les rapports d'erreurs : Sentry, protection des données personnelles, signalement manuel optionnel, conservation 90 jours.",
  alternates: {
    canonical: "https://paranoia.re/rapports-incidents"
  }
};

export default function IncidentReportsPage() {
  return (
    <main>
      <div className="container">
        <header>
          <a className="logo" href="/" aria-label="Accueil">
            <Image src="/logo_paranoia.png" alt="Paranoia logo" width={40} height={40} priority />
            <span>Paranoia</span>
          </a>
          <a className="header-cta" href="/#cta">
            Beta privée en cours →
          </a>
        </header>

        <section className="page-hero">
          <div className="section-header">
            <div className="stacked">
              <span className="hero-eyebrow">Transparence</span>
              <h1>Rapports d&apos;incidents (Sentry)</h1>
              <p className="muted">
                Pour améliorer la stabilité de Paranoia, nous utilisons Sentry (outil de suivi d&apos;erreurs).
                L&apos;objectif est de diagnostiquer les crashs et bugs sans collecter de données personnelles.
              </p>
              <p className="muted">
                Finalité : diagnostic des bugs et mesure de stabilité par version. Base : intérêt légitime à assurer la sécurité et la fiabilité du service.
              </p>
            </div>
            <span className="capsule">Conservation 90 jours</span>
          </div>

          <div className="grid-3">
            <div className="card">
              <div className="tag">Automatique</div>
              <h3>Crashs & erreurs</h3>
              <p>Lorsqu&apos;une erreur inattendue survient, un rapport technique peut être envoyé automatiquement.</p>
              <ul className="list">
                <li>Message d&apos;erreur et trace (stack trace)</li>
                <li>Version de Paranoia (extension/plugin)</li>
                <li>Données techniques (ex. user agent, navigateur/OS, langue)</li>
                <li>Horodatage et identifiant d&apos;événement</li>
              </ul>
              <h4>Sessions (statistiques de stabilité)</h4>
              <p>
                En plus des rapports d&apos;erreurs, Paranoia envoie des événements de session à Sentry pour mesurer la stabilité
                (ex. crash-free sessions) et suivre l&apos;impact des versions. Ces événements ne contiennent pas de contenu (prompts,
                textes, pages consultées) ni d&apos;URL. Ils incluent uniquement :
              </p>
              <ul className="list">
                <li>Un identifiant de session aléatoire (SID)</li>
                <li>Un horodatage</li>
                <li>Version (release) et environnement</li>
                <li>Informations techniques de base (user agent / navigateur)</li>
              </ul>
            </div>

            <div className="card">
              <div className="tag">PII</div>
              <h3>Protection des données</h3>
              <p>Nous configurons Sentry pour supprimer/masquer les champs susceptibles de contenir du PII ou des secrets.</p>
              <ul className="list">
                <li>Masquage d&apos;emails, noms, identifiants, numéros</li>
                <li>Suppression des tokens, clés et secrets si présents</li>
                <li>Limitation du contexte au strict nécessaire</li>
              </ul>
            </div>

            <div className="card accent">
              <div className="tag">Optionnel</div>
              <h3>Signalement manuel</h3>
              <p>Depuis le menu de l&apos;application, vous pouvez envoyer un rapport volontaire avec plus de contexte.</p>
              <ul className="list">
                <li>Description du problème et étapes de reproduction</li>
                <li>Logs de diagnostic (si vous activez l&apos;option)</li>
                <li>Éléments utiles pour comprendre le bug (à votre choix)</li>
                <li>Évitez d&apos;inclure des données client ou des secrets</li>
              </ul>
            </div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <div className="tag">Durée</div>
            <h3>Conservation & accès</h3>
            <p>
              Les rapports d&apos;incidents sont conservés 90 jours maximum, puis supprimés automatiquement.
              L&apos;accès est limité à l&apos;équipe Paranoia en charge du support et de la fiabilité.
            </p>
          </div>

          <div className="faq compact">
            <details open>
              <summary>Pourquoi Google affiche un avertissement ?</summary>
              <p>
                Les plateformes Google affichent un avertissement lorsqu&apos;un plugin déclare l&apos;envoi de données à un service tiers.
                Nous l&apos;utilisons uniquement pour recevoir des rapports d&apos;erreurs et améliorer la stabilité.
              </p>
            </details>
            <details>
              <summary>Est-ce que mes prompts ou contenus sont envoyés ?</summary>
              <p>
                Par défaut, non : Paranoia est conçu pour fonctionner en local. Les envois automatiques concernent uniquement
                des rapports techniques (erreurs) et des événements de session pour des statistiques de stabilité. Aucun contenu
                (prompts, texte, pages/URL) n&apos;est transmis automatiquement. Dans un signalement manuel, le contenu que vous
                saisissez volontairement peut être transmis ; pensez à retirer toute donnée sensible.
              </p>
            </details>
            <details>
              <summary>Comment nous contacter ?</summary>
              <p>
                Écrivez-nous à{" "}
                <a className="inline-link" href="mailto:beta@paranoia.re">
                  beta@paranoia.re
                </a>{" "}
                pour toute question ou pour demander la suppression anticipée d&apos;un rapport.
              </p>
            </details>
          </div>

          <div className="cta-block">
            <div className="section-header">
              <div>
                <h2>Besoin d&apos;aide ?</h2>
                <p className="muted">On peut vous aider à diagnostiquer un incident ou recueillir un signalement plus détaillé.</p>
              </div>
              <a className="btn secondary" href="/#cta">
                Rejoindre la beta
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
