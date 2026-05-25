# paranoia.re

Site Astro autonome pour Paranoia, produit autour de la réduction d'exposition des données sensibles dans les prompts IA.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
npm run check:prod
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
{ "email": "email@entreprise.com", "website": "" }
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
- `WAITLIST_NOTIFY_TO` (optionnel, défaut : `contact@paranoia.re`)

## Backend waitlist

La waitlist ne dépend pas d'une base de données en production. L'email est envoyé au destinataire opérateur configuré depuis `waitlist@send.paranoia.re`, puis un email de confirmation est envoyé au prospect en best-effort avec `contact@paranoia.re` en reply-to.

Protections minimales :

- taille de payload limitée à 4 Ko ;
- validation email côté serveur ;
- honeypot `website` pour réduire le spam automatisé ;
- rate limit mémoire par client : 5 tentatives par 15 minutes ;
- logs d'erreur sans adresse email prospect.

## Monitoring production

`npm run check:prod` controle la production sans creer de lead reel :

- `GET /api/ping` doit retourner `{ "ok": true, "backend": "email" }` et annoncer les protections waitlist v2 ;
- `POST /api/waitlist` avec email invalide doit retourner `400` ;
- `POST /api/waitlist` avec honeypot rempli doit retourner `200` sans envoyer d'email.

Le workflow GitHub Actions `Production Smoke Test` lance ce controle tous les jours a 8h UTC et peut etre lance manuellement. Pour tester un vrai envoi Resend, renseigner `live_waitlist_email` au lancement manuel du workflow.

## Claims

Ne pas revendiquer de certification publique, conformité garantie, absence de risque, traction chiffrée ou rareté artificielle sans preuve publiée. Les prompts originaux sont présentés comme non stockés côté Paranoia ; les traitements waitlist, support, email et incidents restent séparés.
