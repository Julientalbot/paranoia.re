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

- `src/pages` : routes publiques Astro
- `src/layouts` : layout HTML, SEO et Analytics Vercel
- `src/components` : composants Astro et JS client minimal
- `src/styles` : tokens écosystème dupliqués et CSS produit
- `public` : logos et assets servis tels quels

## Contact

Le premier contact passe par email direct :

```txt
contact@paranoia.re
```

Le site ne maintient plus d'endpoint de lead, de waitlist ou de formulaire de qualification. La page indique simplement quoi envoyer : assistant utilisé, données copiées, politique ou contrainte sécurité à tenir.

## Monitoring production

`npm run check:prod` controle la production sans creer de lead reel :

- `GET /` doit retourner la page et exposer le mailto de contact ;
- `GET /rapports-incidents` doit retourner la page d'incidents.

Le workflow GitHub Actions `Production Smoke Test` lance ce controle tous les jours a 8h UTC et peut etre lance manuellement.

## Claims

Ne pas revendiquer de certification publique, conformité garantie, absence de risque, traction chiffrée ou rareté artificielle sans preuve publiée. Les prompts originaux sont présentés comme non stockés côté Paranoia ; le support email et les incidents restent séparés.
