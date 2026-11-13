# Source notes (not linked from the demo)

Read 7 Nov 2026. This file is for the 1APP review. It is not a page in the shop navigation.

## Live site

- https://www.thehubsauceco.com/ is Square Online (Weebly). Homepage meta description: “Canadian Canada hot sauce hotsauce mustard condiment hastings ontario made Hub”.
- Theme name on the snapshot: midnight-yellow. Colours used in the demo: near-black `#180D0D`, cream `#FFECBB`, chilli `#e81b1b`, and the theme’s `#cfdf24` only as a softened herb note. Body font on the live site is Work Sans. Title font is Molle; the demo uses Fraunces for readable headlines and keeps the gold wordmark image.
- Homepage visible copy in the page JSON is the template line “Affordable unique products just right for you,” plus a contact form (Full name, Email, Message). That form is not reproduced. The homepage image is the gold wordmark on a dark field (`IG_5.6.2023_…jpeg`).
- About page (`/about`) has a photo and no biography text in the page JSON. Photo saved as `assets/about.jpg`.
- Header logo: `logo_1683568512.png`. Footer image: Yeti’s Micro Farm (`YMF1_1637687517.png`).
- Social settings selected on the site: email `yetismicrofarm@gmail.com`, Instagram `yetis_micro_farm`. Tony named https://www.instagram.com/thehubsauceco/ as the profile to treat as his. The demo links both and does not embed a feed.

## Instagram

- Public HTML for https://www.instagram.com/thehubsauceco/ returned a logged-out shell (title “Instagram”) with no biography, posts, or profile picture in the initial document. No public reader was available. No `__a`, GraphQL, or login flow was used. No posts were invented.

## Catalog

Public store API the shop itself calls, 7 Nov 2026:

`/app/store/api/v28/editor/users/139950895/sites/556705512444367535/products?include=images,media_files,discounts`

Currency CAD. Six visible products:

| Product | Price | Heat on the page | Catalog badge | Image |
|---|---|---|---|---|
| Gold Metal Mustard | $15.00 | 5/10 | sold out | sugar-skull illustration |
| Da Kine! | $15.00 | 2/10 | sold out | cowboy illustration, plus a label photo |
| Pixie Dust | $12.00 | 3/10 | sold out | label art, “100g” |
| Twister Sister | $15.00 | 3/10 | none | twin-profile illustration |
| Canadian Cue! | $15.00 | 3/10 | sold out | portrait illustration |
| Starter Set | $100.00 | none | low stock | wordmark only |

`inventory.enabled` was false on every product, including the sold-out badges and the starter set (`all_inventory_total` 1). The demo shows the badge and says tracking was off. It does not say “only one left.”

Discount records existed (Pixie Dust “sale” $2 CAD; Canadian Cue and Twister Sister “Sale” $5 CAD) while `on_sale` was false and the listed price was unchanged. Those discounts are not shown as sale prices.

Category “Sauce” (`/shop/sauce/14`) had `product_count.visible` 0. Products are not filed into it in this snapshot, so the demo filters by reading the products themselves (sauce / seasoning / set).

Starter Set copy: “Includes: Gold Metal Mustard, Twister Sister, Canadian Cue, Pixie Dust & SPG+.” SPG+ has no product page in the sitemap or catalog.

Da Kine’s second image is a bilingual nutrition-facts label. OCR and a visual read agree on ingredients (jalapeños, pineapple, pineapple juice, sugars, apple cider vinegar, garlic powder, turmeric) and the address line. Da Kine’s written description has no ingredients list. The label is closer to Twister Sister’s written ingredients. It is shown only on Da Kine, as published, and was not merged into Twister Sister.

Address used in the footer is from that label: Box 566, Hastings, ON K0L 1Y0. OCR read the postal code as KOL1YO; the characters fit the Canadian pattern K0L 1Y0, which also matches a Rural Routes listing. The Square address record is blank (no street, city, phone, or email).

## Location record

Display name “The Hub Sauce Co.” Nickname “Head Office.” Description: “Multi award winning artisan hot sauce and condiments.” Timezone America/Toronto. Hours Monday–Friday 09:00–17:00; weekend empty. `pickup_enabled` false, `delivery_enabled` false, `schedule_pickup_enabled` false, `is_shipping_location` false. Account `fulfillment_support.shipping` was true and `has_shippable_product` true. The demo does not offer pickup, delivery, catering, or tastings, and does not calculate shipping.

Store info: `product_reviews_enabled` false. `avg_rating` null on every product. No reviews were written.

## Not used as facts

- Rural Routes (ruralroutes.com/23388) lists Jordan Leal, phone (705) 772-3810, General Delivery Hastings K0L 1Y0, and “Sauce, Chili oils & Crisps, Green Rush Nutrients.” The phone, host name, and those extra goods are not on the current shop, so they are not in the demo.
- The Village Pantry lists a “Barbecue Season Hot Sauce” at $14.99. That product is not in the current six-item catalog.
- Award names, heat ranks beyond the printed scales, jar sizes other than Pixie Dust’s 100g, guarantees, and scarcity lines were not invented.

## Square ordering

Tony confirmed the owner takes orders in the Square app. The public site is Square Online (`meta generator` = Square Online, `APP_ORIGIN` = `https://square.online`). No Square account, API key, or payment call is used by this demo.

Verified public URLs (sitemap plus HTTP 200 on 7 Nov 2026). These are the only order links in the demo:

| Role | URL | How it was identified |
|---|---|---|
| Order Online page | https://www.thehubsauceco.com/s/order | Sitemap. Page template name “Order Online”, block `order-online-grid`. |
| Shop / category template | https://www.thehubsauceco.com/s/shop | Sitemap. Page template name “Category”. |
| Sauce category | https://www.thehubsauceco.com/shop/sauce/14 | Sitemap. Category id 14, name Sauce. Visible product count in that category was 0 on this date. |
| Gold Metal Mustard | https://www.thehubsauceco.com/product/gold-metal-mustard/23 | Sitemap and catalog `absolute_site_link`. |
| Da Kine! | https://www.thehubsauceco.com/product/da-kine-/32 | Same. |
| Pixie Dust | https://www.thehubsauceco.com/product/pixie-dust/33 | Same. |
| Twister Sister | https://www.thehubsauceco.com/product/twister-sister/36 | Same. |
| Canadian Cue! | https://www.thehubsauceco.com/product/canadian-cue-/37 | Same. |
| Starter Set | https://www.thehubsauceco.com/product/starter-set/38 | Same. |

The basket handoff points at `/s/order`. Each product’s “Open current live Square store” link points at that product’s URL above. A `square.site` hostname was not published in the pages that were read, so none is linked.

Not built, and still needing the owner if they want a connected shop: Square OAuth or API credentials, catalog sync, embedded checkout, webhooks, and any change inside their Square account. This demo does not do those.

Sample booking is a separate illustrative flow. The location record does not enable pickup or scheduled ordering.

## Homepage wording

A later copy pass removed research narration from prominent homepage headings. These points stay here, not in that pitch: product images are the shop’s own illustrations or label art (the Starter Set image is the wordmark); Instagram’s public page did not return posts or a biography, so no feed is embedded; award contests are unnamed; pickup and delivery are not enabled; catalog sold-out and low-stock badges are not repeated on the homepage cards; the live site’s selected Instagram handle is still `yetis_micro_farm`. The homepage still uses only sourced lines: the Canadian Cue origin quote, the location description “multi award winning artisan hot sauce and condiments,” Gold Metal Mustard as the flagship and first sauce, printed heat scales, serving notes including the spelling “creaser,” the label address, and the link to @thehubsauceco. Sample booking on the homepage is labeled illustrative and does not claim a real appointment service.

## Flagship redesign boundaries

Pantry Refill can mix several catalog sauces. Each starts at quantity 0, with a maximum of 12. The running total is the shelf price only. Recurring price, shipping, and tax stay “Pricing to be confirmed.” Nothing is charged.

Visual rebuild keeps the 7 Nov 2026 catalog. Campaign line “Big flavour. Pull up a chair.” is proposed copy, not a Hub quotation. Pantry Refill is a proposed name. No cadence, price, shipping, tax, or cancellation terms are confirmed, so the flow shows “Pricing to be confirmed” and ends with “Demo complete — no subscription started.” Nothing is preselected. No discount and no “cancel anytime” line. Square’s published docs allow fixed shipped item subscriptions; this demo does not connect to Square, and pickup or a rotating box is not assumed. Preview basket contents do not transfer. Live orders use https://www.thehubsauceco.com/s/order and each product’s published URL.

Events: no Hub date after 7 Nov 2026 was verified. Confirmed list is empty. The dashed panel is labeled illustrative, with directions and calendar disabled. Box 566 is a mailing line, not a venue. Sample booking remains at `/hub-sauce-demo/book/` and is not a primary shop action. Sold-out badges are not used as urgency.

## Customer-facing copy

Research notes stay in this file. On the pages, Box 566 is listed under a Mail label with no explanation of how it was read. The line “Multi award winning artisan hot sauce and condiments.” is quoted and attributed to The Hub Sauce Co., because the award names are not verified. Ingredient lists keep the shop’s wording. Demo, illustrative booking, and illustrative Pantry Refill labels stay on those flows.

## Demo behaviour

- Path `/hub-sauce-demo/` only. `noindex` on every page. Basket uses `sessionStorage` for product id and quantity. Booking contact stays in the page until finish, then the inputs are cleared. Nothing is posted.
- Final booking state copy: “Demo complete — no booking made.”
