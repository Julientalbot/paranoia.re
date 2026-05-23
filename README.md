# paranoia.re

Site Astro autonome pour Paranoia, produit autour de la réduction d'exposition des données sensibles dans les prompts IA.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Structure

- `src/pages` : routes publiques et endpoints Astro
- `src/layouts` : layout HTML, SEO et Analytics Vercel
- `src/components` : composants Astro et JS client minimal
- `src/styles` : tokens écosystème dupliqués et CSS produit
- `public` : logos et assets servis tels quels

## Waitlist

`POST /api/waitlist` transmet la demande par email via Resend :

```json
{ "email": "email@entreprise.com" }
```

Réponses :

```json
{ "ok": true }
```

```json
{ "error": "Email invalide" }
```

Variables d'environnement serveur :

- `RESEND_API_KEY`
- `WAITLIST_NOTIFY_TO` (optionnel, défaut : `beta@paranoia.re`)

## Backend waitlist

La waitlist ne dépend pas d'une base de données en production. L'email est envoyé au destinataire opérateur configuré, puis un email de confirmation est envoyé au prospect en best-effort.

## Claims

Ne pas revendiquer de certification publique, conformité garantie, absence de risque, traction chiffrée ou rareté artificielle sans preuve publiée. Les prompts originaux sont présentés comme non stockés côté Paranoia ; les traitements waitlist, support, email et incidents restent séparés.
