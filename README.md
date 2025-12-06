# paranoia.re

Landing page Next.js (app router) pour Paranoia.

## Démarrer

```bash
npm install
npm run dev
```

## Notes

- Copie et UI en français, focalisées sur la beta privée.
- Formulaire email branché sur Supabase (table `waitlist`), en POST via l'API route.
- Pas de stockage côté Paranoia : tout le contenu reste local sur le poste utilisateur (rappelé dans la page). Le waitlist est stocké dans Supabase.
- Logo : `public/logo-paranoia.svg` (utilisé en header et comme favicon). Palette : fond bleu nuit (#0a0f1f), accents mint (#2de8da) et bleu lavande (#7b8fff).

## Supabase (waitlist)

1. Crée une base Supabase et ajoute deux variables d'environnement côté Vercel (ou `.env.local` pour dev) :
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (service role key, uniquement côté serveur)
2. Table minimale :

```sql
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);
```

3. L'API POST `/api/waitlist` insère l'email (gère l'unicité). En local, le front appelle cette route via `fetch`.
