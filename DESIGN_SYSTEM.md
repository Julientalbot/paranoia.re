# Ecosystem Operational Taste System

Copie locale du design system ecosysteme. `paranoia.re` reste un repo autonome : pas de monorepo, pas de package partage en v1.

## Doctrine

Le systeme combine trois couches, dans cet ordre :

1. `Ecosystem truth` : roles des marques, claims prudents, preuves assumables.
2. `xAI proof grammar` : promesse courte, artifact visible, preuve, chemins de demarrage, footer utile.
3. `taste layer` : composition, rythme, anti-slop, responsive strict, etats UI.

Le systeme copie la grammaire operationnelle de xAI, pas son identite. Une page doit montrer une capacite observable avant d'expliquer longuement sa promesse. Le taste-skill sert de couche de qualite d'execution ; il ne peut pas override la preuve, l'accessibilite, la sobriete ou l'autonomie des repos.

## EOTS Dials

```text
paranoia.re
DESIGN_VARIANCE 5
MOTION_INTENSITY 2
VISUAL_DENSITY 8
Direction : produit inspectable, console, trust, incidents, limites.
```

Taste rules retenues : pas de hero centre generique, pas de 3-card SaaS row par reflexe, pas de glow neon, pas de gradients de texte, pas de motion lourde par defaut, etats loading/empty/error quand une interface collecte ou traite une action utilisateur.

Taste rules bloquees : glassmorphism decoratif, motion perpetuelle, GSAP/Three par reflexe, composants partages prematurement, effets visuels qui remplacent une preuve.

## Public Copy Boundary

La strategie interne guide les textes publics, mais ne doit pas apparaitre comme vocabulaire public. Les pages parlent depuis le besoin du visiteur : detecter, masquer, relire, documenter les limites, signaler un incident. Les mots d'architecture comme hub, surface achetable, fusion, repo, package, kernel, claims ou surfaces futures restent dans les docs internes.

La sequence standard est :

1. `HeroStatement` : promesse produit courte, autonome, prudente.
2. `CapabilityDeck` : detecter, proteger, transmettre, documenter.
3. `ConsolePanel` : avant/apres prompt, policy, trace de revue.
4. `MetricStrip` : etats produit, limites, documentation, beta.
5. `StartPaths` : beta et incidents.
6. `DenseFooter` : produit, trust, legal, contact, incidents.

## EOTS V3

La V3 ajoute une exigence de gout operationnel. Une home complete suit maintenant cette sequence : promesse courte, artifact reel, capacites, preuves recentes, chemins de demarrage, footer dense.

Les primitives V3 sont `ProofWall`, `EvidenceMetrics`, `ArtifactPanel`, `NewsOrSignals`, `StateRail` et `TrustFooter`. Paranoia les utilise pour montrer incidents, limites, documentation, etats produit et liens trust sans certification ou garantie non prouvee.

## Fichiers

Chaque repo garde une copie locale de ces fichiers :

```text
src/styles/ecosystem-tokens.css
src/styles/xai-copy-system.css
src/styles/x-operational-system.css
DESIGN_SYSTEM.md
```

`ecosystem-tokens.css` porte les tokens bruts communs.

`xai-copy-system.css` porte la grammaire xAI page par page : shell `1232px`, titres non condenses, poids maximum `500`, artifacts, ledgers, listes, chemins cliquables, lecture longue et bloc de demarrage final.

`x-operational-system.css` porte les primitives communes : `.xo-page`, `.xo-shell`, `.xo-nav`, `.xo-hero`, `.xo-capability-grid`, `.xo-card`, `.xo-console`, `.xo-metric-strip`, `.xo-start-paths`, `.xo-state-rail`, `.xo-footer`.

## Assets

Les assets d'identite restent locaux dans `public/` :

- `logo.svg` : wordmark produit noir/blanc avec point froid.
- `logo.png` : export PNG haute resolution du wordmark, utile pour reseaux sociaux et documents qui n'acceptent pas le SVG.
- `logo-mark.svg` : marque `P` avec point froid, utilisee dans la navigation et les petits formats.
- `logo-mark.png` : export PNG 1024x1024 du mark, utile pour avatars ou imports externes.
- `favicon.svg` : favicon harmonise avec le mark a point.
- `favicon.png` : export PNG 512x512 du favicon.
- `social-card.svg` et `social-card.png` : carte Open Graph 1200x630.
- `logo-paranoia.svg` et `logo_paranoia.png` : aliases de compatibilite conserves pour eviter les liens casses.
- `social/` : exports reseaux sociaux LinkedIn et X, avec sources SVG pour les covers/cards et PNG prets a publier.

Regles : Paranoia doit ressembler a un produit de confidentialite inspectable, pas a un embleme cyber fictionnel. Les assets ne doivent pas suggerer une certification, une securite totale ou une rarete artificielle.

Direction imagegen : les assets de flux (`social/linkedin-share.png`, `social/x-card.png`) et le header X final (`social/x-header.png`) utilisent la piste raster generee avec texte integre et details graphiques, car elle est moins generique en usage social. Le header X est volontairement en anglais pour l'audience IA/produit internationale. Les SVG equivalents restent les sources/fallbacks editables quand il faut regenerer proprement.

Assets sociaux :

- `social/linkedin-profile.png` : logo 400x400, regenere depuis le mark actuel.
- `social/linkedin-cover.png` : couverture LinkedIn Page 4200x700, avatar-safe avec artifact produit inspectable.
- `social/linkedin-share.png` : image de partage LinkedIn 1200x627, finale imagegen.
- `social/x-profile.png` : logo 400x400, regenere depuis le mark actuel.
- `social/x-header.png` : header X 1500x500, final imagegen anglais retouche pour ne pas placer de texte utile sous la photo de profil.
- `social/x-card.png` : card X 1200x600, finale imagegen.

## Skin Paranoia

`paranoia.re` est une surface produit securite/confidentialite IA. Elle porte ses propres preuves, limites, documentation, support, incidents, waitlist API et future tarification.

La peau est sombre, dense, technique, proche d'une console produit. Elle ne doit pas devenir une ambiance fictionnelle : chaque surface doit montrer une capacite ou une limite inspectable.

Claims autorises : aide a reduire l'exposition, traitement local quand c'est vrai, absence de stockage des prompts originaux cote Paranoia quand c'est vrai, beta.

Claims a eviter : certification non obtenue, conformite automatique, securite totale, rarete artificielle, chiffres non sources.

## Regles Visuelles

- Palette sombre neutre, lignes fines, accent froid rare.
- Rayon de panel a `8px`, controls plus arrondis seulement quand ils sont interactifs.
- Pas de sections brochure decoratives, pas de blobs, pas de cartes imbriquees.
- Typographie fixe par breakpoint, sans taille liee directement a la largeur viewport.
- Les artifacts doivent montrer le produit : prompt avant/apres, policy, limites, incident, documentation.
- Les metriques doivent etre prouvees, qualifiees, ou remplacees par des etats descriptifs.
- Les cartes existent seulement quand elles portent une surface produit, une limite ou un chemin trust.
- Les interactions restent CSS-first : hover, focus-visible, active, reduced-motion. Pas de runtime motion tant qu'un besoin produit ne le justifie pas.
- Les themes clair et sombre doivent rester equivalents : pas de page forcee dans un seul theme, pas de CTA illisible apres inversion de scheme.

## Extension

Un futur site commence avec les trois fichiers du systeme, puis definit seulement sa peau : accent, role, CTA, artifacts, preuves autorisees.

Aucune nouvelle primitive n'est creee avant d'avoir tente d'utiliser le kernel existant. Si une primitive devient necessaire dans deux sites, elle est ajoutee dans chaque copie locale lors d'un passage volontaire de synchronisation.

## QA

Verifier chaque page publique en desktop, en 390px mobile, en clair et en sombre :

- aucun overflow horizontal ;
- header lisible ;
- CTA beta ou incidents visible tot ;
- artifact, preuve ou action dans le premier ecran ;
- action de demarrage finale sur les pages non legales ;
- deck de capacites visible avant les explications longues ;
- produit autonome, sans emprunter la preuve de Julien ;
- claims prudents, sourcables, sans urgence artificielle.

## Affinages 2026-05-25

Voir la mise à jour du document racine `DESIGN_SYSTEM_XAI_TASTE_2026-05-23.md` (section 2026-05-25).

Spécifiquement pour cette peau (produit trust / console sécurité) :
- Pousser au maximum le sentiment **"console produit inspectable"** : traces, before/after, incidents, policy et limites doivent être les surfaces les plus vivantes et rejouables de la page.
- Les artefacts techniques (prompts masqués, détections, rapports) doivent donner l'impression d'un outil réel en production, pas d'une promesse.
