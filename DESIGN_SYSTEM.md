# X-Operational Design System

Copie locale du design system ecosysteme. `paranoia.re` reste un repo autonome : pas de monorepo, pas de package partage en v1.

## Doctrine

Le systeme copie la grammaire operationnelle de xAI, pas son identite. Une page doit montrer une capacite observable avant d'expliquer longuement sa promesse.

## Public Copy Boundary

La strategie interne guide les textes publics, mais ne doit pas apparaitre comme vocabulaire public. Les pages parlent depuis le besoin du visiteur : detecter, masquer, relire, documenter les limites, signaler un incident. Les mots d'architecture comme hub, surface achetable, fusion, repo, package, kernel, claims ou surfaces futures restent dans les docs internes.

La sequence standard est :

1. `HeroStatement` : promesse produit courte, autonome, prudente.
2. `CapabilityDeck` : detecter, proteger, transmettre, documenter.
3. `ConsolePanel` : avant/apres prompt, policy, trace de revue.
4. `MetricStrip` : etats produit, limites, documentation, beta.
5. `StartPaths` : beta et incidents.
6. `DenseFooter` : produit, trust, legal, contact, incidents.

## X-Operational V2

La V2 ajoute une exigence de preuve et de recence. Une home complete suit maintenant cette sequence : promesse courte, capacites, artifact reel, preuves recentes, chemins de demarrage, footer dense.

Les primitives V2 sont `ProofWall`, `EvidenceMetrics`, `ArtifactPanel`, `NewsOrSignals` et `TrustFooter`. Paranoia les utilisera plus tard pour montrer incidents, limites, documentation, etats produit et liens trust sans certification ou garantie non prouvee.

## Fichiers

Chaque repo garde une copie locale de ces fichiers :

```text
src/styles/ecosystem-tokens.css
src/styles/x-operational-system.css
DESIGN_SYSTEM.md
```

`ecosystem-tokens.css` porte les tokens bruts communs.

`x-operational-system.css` porte les primitives communes : `.xo-page`, `.xo-shell`, `.xo-nav`, `.xo-hero`, `.xo-capability-grid`, `.xo-card`, `.xo-console`, `.xo-metric-strip`, `.xo-start-paths`, `.xo-footer`.

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

## Extension

Un futur site commence avec les trois fichiers du systeme, puis definit seulement sa peau : accent, role, CTA, artifacts, preuves autorisees.

Aucune nouvelle primitive n'est creee avant d'avoir tente d'utiliser le kernel existant. Si une primitive devient necessaire dans deux sites, elle est ajoutee dans chaque copie locale lors d'un passage volontaire de synchronisation.

## QA

Verifier la home en desktop et en 390px mobile :

- aucun overflow horizontal ;
- header lisible ;
- CTA beta ou incidents visible tot ;
- deck de capacites visible avant les explications longues ;
- produit autonome, sans emprunter la preuve de Julien ;
- claims prudents, sourcables, sans urgence artificielle.
