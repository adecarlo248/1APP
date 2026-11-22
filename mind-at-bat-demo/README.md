# Mind At Bat — Storefront Demo (for Belinda)

A clickable, static revamp of www.mindatbat.ca. **Demo only — not the live store.** Nothing here touches the live Wix site, domain, DNS, or checkout.

## How to open
**Easiest:** unzip the demo zip and double-click `index.html`. Every page opens in any browser — no install, no internet needed except for the web fonts.

**Or run a local server** (the same thing, but with clean URLs):
```
cd mindatbat-demo
python3 -m http.server 8766
# then open http://localhost:8766/
```

## Pages
| Page | File |
|---|---|
| Home | `index.html` |
| Shop (All / Tees / Hoodies / Truckers / Beanies + sort) | `shop.html` (`shop.html?f=tee`, `?f=hoodie`, `?f=trucker`, `?f=beanie`) |
| Product detail (one template, all catalog items) | `product.html?slug=…` |
| Our Heritage (story, timeline, founder letter) | `about.html` |
| Contact (support, demo form, shipping/refund policy) | `contact.html` |

Catalog was synced from the live Wix store on 22 Nov 2026 (America/Toronto). Live product slugs:

- Heritage Hoodie — `product.html?slug=unisex-hoodie-2`
- Rally Hoodie — `product.html?slug=unisex-hoodie-1`
- Rally Heritage T-Shirt — `product.html?slug=rally-heritage-t-shirt`
- Rally OG T-Shirt — `product.html?slug=unisex-t-shirt`
- All Star Heritage Trucker Hat — `product.html?slug=all-star-heritage-trucker-hat`
- All Star Rally Trucker Hat — `product.html?slug=all-star-rally-trucker-hat`
- Bullpen Trucker Hat — `product.html?slug=bullpen-trucker-hat`
- Mind At Bat Beanie — `product.html?slug=embroidered-beanie`
- Diamond Hoodie — `product.html?slug=diamond-hoodie`
- Diamond Pink Hoodie — `product.html?slug=unisex-hoodie`
- Diamond Shadow Hoodie — `product.html?slug=diamond-shadow-hoodie`
- Bullpen Diamond Trucker Hat — `product.html?slug=bullpen-diamond-trucker-hat`
- Diamond Pom Beanie — `product.html?slug=pom-pom-beanie`

Coming-soon placeholders (not on the live store yet): Rally Pink Tee (`rally-pink-tee`), Punk Hoodie (`punk-hoodie`).

The live Rally Classic T-Shirt (`unisex-t-shirt-1`) is still on mindatbat.ca but is left out of this demo per Justin's 6 Nov 2026 direction. The three Underdog flat-peak caps are gone from the live store (their old URLs 404).

## What is real vs demo
- **Real (pulled from the live site, 22 Nov 2026):** product names, CAD prices including per-size upcharges, colour/size options, in-stock flags, descriptions, features, product photos, logo, heritage timeline, founder's letter, shipping/refund policy wording, contact details.
- **Demo UI only:** cart (saved in the browser only), checkout button, newsletter signup and contact form — none submit anywhere.
- Slugs match the live Wix product URLs so a future migration keeps the same links.

## Files
- `css/styles.css` — all styles + brand tokens (near-black #0f0f0f, charcoal #272727, field green #2e382e, underbill green #00603b)
- `js/catalog.js` — the full product catalog as JSON (`window.MAB_CATALOG`), ready to import into any store platform
- `js/main.js` — header/footer, cart drawer, filters, product page logic
- `assets/` — logo, mark, hero and web-optimized product photos
