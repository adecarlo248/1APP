# Mind At Bat — Storefront Demo (for Belinda)

A clickable, static revamp of www.mindatbat.ca. **Demo only — not the live store.** Nothing here touches the live Wix site, domain, DNS, or checkout.

## How to open
**Easiest:** unzip `mindatbat-demo.zip` and double-click `index.html`. Every page opens in any browser — no install, no internet needed except for the web fonts.

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
| Shop (All / Tees / Caps filter + sort) | `shop.html` (`shop.html?f=tee`, `shop.html?f=cap`) |
| Product detail (one template, all 6 products) | `product.html?slug=…` |
| Our Heritage (story, timeline, founder letter) | `about.html` |
| Contact (support, demo form, shipping/refund policy) | `contact.html` |

Product links:
- Rally Heritage T-Shirt — `product.html?slug=rally-heritage-t-shirt`
- Rally Classic T-Shirt — `product.html?slug=unisex-t-shirt-1`
- Rally OG T-Shirt — `product.html?slug=unisex-t-shirt`
- Underdog Heritage — `product.html?slug=underdog-heritage`
- Underdog Classic — `product.html?slug=underdog-classic`
- Underdog OG — `product.html?slug=flat-bill-cap`

## What is real vs demo
- **Real (pulled from the live site, Nov 6 2026):** all 6 product names, CAD prices incl. per-size pricing on tees (2XL–5XL upcharges), colour options, descriptions, features, product photos, logo, heritage timeline, founder's letter, shipping/refund policy wording, contact details.
- **Demo UI only:** cart (saved in the browser only), checkout button, newsletter signup and contact form — none submit anywhere.
- Slugs match the live Wix product URLs so a future migration keeps the same links.

## Files
- `css/styles.css` — all styles + brand tokens (near-black #0f0f0f, charcoal #272727, field green #2e382e, underbill green #00603b)
- `js/catalog.js` — the full product catalog as JSON (`window.MAB_CATALOG`), ready to import into any store platform
- `js/main.js` — header/footer, cart drawer, filters, product page logic
- `assets/` — logo, mark, hero and web-optimized product photos
