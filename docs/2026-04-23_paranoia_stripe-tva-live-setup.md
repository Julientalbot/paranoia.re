# Configurer un taux de TVA (8,5% La Réunion) sur un produit Stripe — environnement **live / production**

> Destinataire : CTO paranoia.re
> Auteur : Julien Talbot
> Date : 2026-04-23
> Statut : procédure validée en production sur `prod_UO69xslc5AtQLm` (Licence plugin paranoia, 3,99 € TTC/mois)

---

## 1. Ce qu'il faut comprendre avant de toucher Stripe

Stripe a **deux systèmes de taxes distincts**, non interchangeables :

| Système | Préfixe ID | Quand l'utiliser |
|---|---|---|
| **Tax Rates** (classique) | `txr_...` | Tu fixes toi-même un taux (ex : 8,5%). Tu l'attaches aux ventes. |
| **Tax Codes / Stripe Tax** (automatique) | `txcd_...` (standard) ou `taxcstm_...` (custom) | Classifie le produit ; Stripe calcule le taux selon la juridiction du client. Requiert Stripe Tax activé + registrations fiscales. |

On reste sur **Tax Rates** tant que Stripe Tax n'est pas activé.

**Points critiques à mémoriser :**

- Un `Tax Rate` **ne s'attache pas à un `Product` ni à un `Price`**. Il s'applique au **moment de la vente** : `Checkout Session`, `Subscription`, `Invoice`, ou `Payment Link` (partiellement).
- Un `Price` a un champ `tax_behavior` (`inclusive` | `exclusive` | `unspecified`). **Stripe refuse d'appliquer un `Tax Rate` à un `Price` dont le `tax_behavior` est `unspecified`.**
- `tax_behavior` est **irréversible** une fois défini. Pour changer, il faut créer un nouveau `Price` et archiver l'ancien.
- `inclusive` = prix affiché TTC (ex : 3,99 €, dont 0,31 € TVA). `exclusive` = prix HT, la TVA s'ajoute.

---

## 2. Prérequis (à faire une seule fois)

### Permissions API

La clé restricted **live** utilisée par le CLI / l'intégration doit avoir les scopes **Write** suivants :

- `Tax rates`
- `Products`
- `Prices`
- `Checkout Sessions`
- `Payment Links` (uniquement si tu utilises ce mode)

Dashboard → **Developers → API keys** → éditer la restricted key → cocher les `Write` correspondants → **Save**.

Après modification, Stripe réaffiche le secret **une seule fois** : le copier immédiatement.

### CLI authentifié en live

```bash
stripe login
# ou, avec une restricted key précise :
STRIPE_API_KEY=rk_live_xxx stripe tax_rates list --live
```

Vérifier que le compte cible est bien **Ergonomia** :

```bash
stripe config --list | grep display_name
```

---

## 3. Procédure — 3 étapes

### Étape 1 — Créer le Tax Rate en live

```bash
stripe tax_rates create \
  --live \
  --display-name="TVA 8,5%" \
  --percentage=8.5 \
  --inclusive \
  --country=FR \
  --description="TVA La Réunion 8,5%" \
  --jurisdiction="La Réunion"
```

- `--inclusive` : le prix du `Price` est TTC. Pour un prix HT, retirer `--inclusive` (défaut = exclusive).
- `display-name` : **visible par le client** sur la facture. Rester concis et juste (`TVA 8,5%` est suffisant).
- `description` / `jurisdiction` : internes / reporting.

Récupérer l'ID retourné : `txr_...`.

> Valeur actuelle en production : `txr_1TPKUTP3Pnhe58gprSgwOKVz`

### Étape 2 — Définir `tax_behavior` sur le Price

⚠️ **Irréversible** — bien vérifier que le montant du `Price` correspond à ce qu'on déclare (TTC ou HT).

```bash
stripe prices update price_XXXXX \
  --live \
  --tax-behavior=inclusive
```

Vérifier le retour : `"tax_behavior": "inclusive"`.

> Valeur actuelle : `price_1TPJx6P3Pnhe58gp3nTUY0rw` en `inclusive` (3,99 € TTC).

### Étape 3 — Appliquer le Tax Rate lors de la vente

Le tax rate est passé **au moment de créer la Checkout Session / Subscription / Invoice**. Exemples côté code (Node SDK) :

#### Checkout Session (abonnement)

```js
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  success_url: 'https://paranoia.re/success',
  line_items: [{
    price: 'price_1TPJx6P3Pnhe58gp3nTUY0rw',
    quantity: 1,
    tax_rates: ['txr_1TPKUTP3Pnhe58gprSgwOKVz'],
  }],
});
```

#### Subscription créée directement via API

```js
await stripe.subscriptions.create({
  customer: 'cus_xxx',
  items: [{ price: 'price_1TPJx6P3Pnhe58gp3nTUY0rw' }],
  default_tax_rates: ['txr_1TPKUTP3Pnhe58gprSgwOKVz'],
});
```

#### Invoice manuelle

```js
await stripe.invoiceItems.create({
  customer: 'cus_xxx',
  price: 'price_1TPJx6P3Pnhe58gp3nTUY0rw',
  tax_rates: ['txr_1TPKUTP3Pnhe58gprSgwOKVz'],
});
```

#### ⚠️ Payment Links

Les **Payment Links n'acceptent pas `line_items[].tax_rates`** via l'API. Pour une URL statique taxée, deux options :
- Activer **Stripe Tax** et utiliser `automatic_tax[enabled]=true`.
- Générer une Checkout Session à la volée côté serveur (ce qu'on fait aujourd'hui).

---

## 4. Vérification en production sans débiter

Créer une Checkout Session live et ouvrir l'URL :

```bash
stripe checkout sessions create \
  --live \
  --mode=subscription \
  --success-url="https://paranoia.re/success" \
  -d "line_items[0][price]=price_1TPJx6P3Pnhe58gp3nTUY0rw" \
  -d "line_items[0][quantity]=1" \
  -d "line_items[0][tax_rates][0]=txr_1TPKUTP3Pnhe58gprSgwOKVz"
```

Contrôler dans le JSON :

```json
"amount_total": 399,          // 3,99 € TTC
"total_details": {
  "amount_tax": 31             // 0,31 € de TVA (8,5% de 3,68 € HT)
}
```

Ouvrir l'URL retournée pour vérifier l'affichage côté client (ligne "TVA 8,5% inclus 0,31 €"). Ne pas payer.

---

## 5. Checklist pour refaire ce setup sur un **nouveau produit**

1. [ ] Confirmer que le Tax Rate live `txr_...` existe (sinon, le créer — étape 1).
2. [ ] Vérifier que le `Price` du nouveau produit est bien TTC (ou HT) tel qu'on l'a défini.
3. [ ] Appliquer `tax_behavior` sur le `Price` (étape 2). **Vérifier deux fois avant, c'est irréversible.**
4. [ ] Mettre à jour le code qui crée les Checkout Sessions / Subscriptions / Invoices pour inclure `tax_rates: ['txr_...']`.
5. [ ] Créer une Checkout Session de contrôle (étape 4). Vérifier `amount_tax`.
6. [ ] Ouvrir l'URL et vérifier l'affichage client.
7. [ ] Archiver (ne pas supprimer) les anciens `Price` rendus obsolètes si on a dû en recréer.

---

## 6. IDs de référence — production

| Objet | ID |
|---|---|
| Produit | `prod_UO69xslc5AtQLm` (Licence plugin paranoia) |
| Prix | `price_1TPJx6P3Pnhe58gp3nTUY0rw` (3,99 € TTC / mois, `inclusive`) |
| Tax Rate | `txr_1TPKUTP3Pnhe58gprSgwOKVz` (TVA 8,5%, inclusive, FR / La Réunion) |
| Compte Stripe | `acct_1QboGxP3Pnhe58gp` (Ergonomia) |

---

## 7. Pièges rencontrés (à éviter)

- **Confusion `taxcstm_...` vs `txr_...`** : un `taxcstm_...` est un *custom tax code* (Stripe Tax), pas un taux fixe. On ne peut pas lui assigner 8,5% directement. Ce n'est pas ce qu'on veut ici.
- **Clé restricted sans les bons scopes** : l'erreur `does not have the required permissions` indique qu'il manque un `Write`. Re-cocher côté dashboard, re-révéler la clé, relancer `stripe login`.
- **`tax_behavior: unspecified`** : Stripe rejettera silencieusement le calcul de TVA. Toujours vérifier ce champ sur chaque nouveau Price.
- **Tax Rate créé en test puis attendu en live** : les objets Stripe test et live sont **totalement séparés**. Il faut créer le tax rate deux fois (ou utiliser uniquement live une fois la procédure rodée en test).
- **Payment Links + `tax_rates`** : l'API retourne `Received unknown parameter: line_items[0][tax_rates]`. Utiliser Checkout Session à la place.

---

## 8. Aller plus loin — bascule vers Stripe Tax (optionnel, moyen terme)

Si on vend à l'international ou dans plusieurs juridictions françaises (métropole vs DOM), maintenir des `Tax Rate` manuels devient intenable. Migration :

1. Activer **Stripe Tax** (Settings → Tax).
2. Enregistrer les juridictions fiscales (FR métropole, La Réunion…).
3. Assigner un `tax_code` standard (`txcd_10103101` pour SaaS, déjà le cas sur `prod_UO69xslc5AtQLm`).
4. Passer `automatic_tax: { enabled: true }` sur les Checkout Sessions et retirer `tax_rates` des line_items.
5. Gérer la collecte du `customer_address` (obligatoire pour le calcul automatique).

À évaluer quand le volume ou le périmètre géographique le justifie.
