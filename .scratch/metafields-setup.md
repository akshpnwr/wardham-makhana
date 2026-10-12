# Product page info: store setup

Do these in order. The theme code is already in place; until step 1–2 are done the new blocks simply render nothing.

## 1. Create the metafield definitions

Shopify admin → Settings → Custom data → Products → Add definition. Namespace and key must match exactly.

| Name | Namespace and key | Type | Notes |
|---|---|---|---|
| Highlights | `custom.highlights` | Single line text → **List of values** | Limit to preset choices: High Fibre, Gluten Free, Calcium Rich, Plant Protein, Rich in Antioxidants, Boosts Immunity, Satisfies Hunger |
| Ingredients | `custom.ingredients` | Multi-line text | |
| Allergens | `custom.allergens` | Multi-line text | One statement per line |
| Storage | `custom.storage` | Multi-line text | |
| Shelf life | `custom.shelf_life` | Single line text | |
| Nutrition | `custom.nutrition` | Multi-line text | One nutrient per line: `Name \| Value`. Start a line with `- ` to indent it under the row above (e.g. `- Total Sugar \| 1 g`). The first Energy/Calories row is shown as the large headline figure |
| Nutrition basis | `custom.nutrition_basis` | Single line text | `Per 100 g` or `Per serving` (defaults to Per 100 g when empty) |
| Serving size | `custom.serving_size` | Single line text | |
| Manufacturer override | `custom.manufacturer_override` | Multi-line text | Only for products whose legal text differs from the shared text |

## 2. Import the data

Products → Import → choose `.scratch/metafields-import.csv` → tick **Overwrite products with matching handles**.

The file only carries Handle, Title, the option columns, the metafield columns and the unit price columns, so other product fields are untouched. It sets:
- unit price on all 22 products (45 / 75 / 90 / 250 g, per 1 g), so the price row shows e.g. "Rs. 2.10/g"
- info for the 6 canisters, 6 standies and 2 raw makhana products
- no info for the 8 pet jars yet (only unit price)

Spot-check one product afterwards: its metafields panel should show the values, and the variant should show a unit price.

## 3. Check in the theme editor

Online Store → Themes → Customize → Products → Default product. In the Product information section you should see the **Highlights** and **Product information** blocks. The shared manufacturer & legal text is edited in the Product information block.

## 4. Check against the physical packs (copied as-is from the old descriptions)

- **Gold Plus**: Marketed-by FSSAI number reads `104250000001112` (one extra 0 vs `10425000001112` everywhere else). Imported as a manufacturer override; if it is a typo, clear the override on that product.
- **Salt & Pepper Standies**: flavour enhancer `INS 627`; the canister says `INS 621`.
- **Cream & Onion**: standies say "Edible Vegetable Fat Powder", canister says "Edible Vegetable Fat (Palm)".
- **Raw makhana (both)**: "Serving size 250 g" with 370 kcal — 370 kcal is typical per 100 g, not per 250 g. Imported as basis "Per serving", serving size "250 g (approx.)".

## 5. Fix import (highlights + trimmed descriptions)

Import these the same way (overwrite matching handles):
- `.scratch/fix-highlights.csv` — **now**. 12 flavoured products; highlights as one item per line (the first import joined them with `;`, which Shopify stored as a single item). The live theme doesn't show highlights, so this is safe.
- `.scratch/trim-descriptions.csv` — 14 products; description cut to the one-line tagline. Descriptions are shared by all themes, so on a store with real traffic this belongs at publish time (the old Dawn theme has no accordion). The store isn't handed over yet, so importing now is fine.

## 6. Later

- Fill pet jar metafields (and highlights for raw makhana).
