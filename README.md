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

`POST /api/waitlist` garde le contrat existant :

```json
{ "email": "email@entreprise.com" }
```

Réponses :

```json
{ "ok": true }
```

```json
{ "ok": true, "duplicate": true }
```

```json
{ "error": "Email invalide" }
```

Variables d'environnement serveur :

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`

## Supabase

Table minimale :

```sql
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);
```

## Claims

Ne pas revendiquer de certification publique, conformité garantie, absence de risque, traction chiffrée ou rareté artificielle sans preuve publiée. Les prompts originaux sont présentés comme non stockés côté Paranoia ; les traitements waitlist, support, email et incidents restent séparés.
