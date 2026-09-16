# paranoia.re

Site Astro autonome pour Paranoia, produit autour de la réduction d'exposition des données sensibles dans les prompts IA.

## Scripts

```bash
npm ci
npm run dev
npm run build
npm run preview
npm run check:prod
```

## Structure

- `src/pages` : routes publiques Astro
- `src/layouts` : layout HTML, SEO et Analytics Vercel
- `src/components` : composants Astro et JS client minimal
- `src/styles` : tokens écosystème dupliqués et CSS produit
- `public` : logos et assets servis tels quels

## Contact

Canal primaire : formulaire sur `/pilote#contact` (et `/en#contact`) → `POST /api/contact` → Resend.

Secours : `mailto:contact@paranoia.re` (les webviews X/LinkedIn bloquent souvent le mailto).

Trois lignes : assistant / flux, ce qui risque de partir dans le prompt, la contrainte.

## Monitoring production

`npm run check:prod` controle la production sans creer de lead reel :

- `GET /` et `GET /pilote` exposent le formulaire et le mailto de secours ;
- `GET /rapports-incidents` doit retourner la page d'incidents.

Le workflow GitHub Actions `Monitor production` lance ce contrôle chaque lundi
à 7 h 30 UTC et peut être lancé manuellement. Il utilise uniquement `fetch` et
n'installe pas les dépendances du site.

## Claims

Ne pas revendiquer de certification publique, conformité garantie, absence de risque, traction chiffrée ou rareté artificielle sans preuve publiée. Les prompts originaux sont présentés comme non stockés côté Paranoia ; le support email et les incidents restent séparés.
