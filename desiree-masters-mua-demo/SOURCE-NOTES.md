# Source notes (not linked from the demo)

Internal notes for review. This file is not in the site navigation.

Collected 12 Nov 2026 from Desiree Masters’ public Instagram while logged out, plus the Facebook page URL. Facebook itself was login-walled. Nothing on the customer-facing pages was taken from other artists’ sites. Prices, policies, and package names from the makeup-artist research are not shown.

## Where it lives

- Files live only in `desiree-masters-mua-demo/`.
- `noindex, nofollow` on both HTML pages.
- Not added to `sitemap.xml` or `robots.txt`. Not linked from the main site nav.
- Nothing under `r/` was changed.
- Links inside the demo are relative, so the folder works at `/desiree-masters-mua-demo/`.

## Verified and shown

- Name and display name: Desiree Masters, Desiree Masters Makeup Artist. Category on Instagram: Makeup Artist.
- Bio, as captured (the line was cut off): “Specializing in Luxurious Glamorous style.” Services in that bio: Bridal, Prom, Photo shoots, Special Events. The biography continued “Peterborough & The…” and the rest was hidden.
- Service area used on the page: Peterborough & the Kawarthas, Ontario. Lindsay and Little Britain are mentioned because those place names appear in her hashtags (`#lindsayontariomakeupartist`, `#littlebritain`).
- Instagram: https://www.instagram.com/desireemastersmua/
- Facebook: https://www.facebook.com/DesireeMastersMakeup (the share link redirected here; the page itself did not load logged out).
- Counts, dated 12 Nov 2026: 761 followers, 161 posts. “Following” is not shown.
- Services named from her posts and bio: Bridal, bridal preview/trial, bridal party, mother of the bride, Prom, Photo shoots, Special Events.

### Photographs

Instagram logged-out crops, about 640 pixels square. Committed as the original JPEG plus a WebP. They are framed, not stretched.

| File | What it is |
|---|---|
| `desiree.jpg` | Desiree herself. Sent by Tony 12 Nov 2026, 1206×1205, black bars already cropped off. Used for the hero, the About portrait, and `og.jpg`. | 
| `abbie.jpg` | Bridal client Abbie, 3 Nov 2026. Post https://www.instagram.com/desireemastersmua/p/DfSsefHnxZj/ . She is described as a fellow tradeswoman in the beauty industry. Hair that morning was credited to another artist; the handle is not printed. Shown in the gallery, not as Desiree. |
| `amanda.jpg` | Amanda, 12 Oct 2026. Romantic soft glam, glitter setting spray. https://www.instagram.com/desireemastersmua/p/DeZZyVFkRRJ/ |
| `rebecca-preview.jpg` | Rebecca’s bridal preview, 15 Sep 2026. Soft and bronzed, cat-eye lashes, for an October wedding. Before and after. https://www.instagram.com/desireemastersmua/p/DdUyK2EH_Tn/ |
| `mother-of-bride.jpg` | Mother of the bride, 30 Aug 2026. Soft bronzed glam, defined darker brows, eyes made to pop, colours for a rusty dress. https://www.instagram.com/desireemastersmua/p/Dcq0_4nkQwq/ |
Removed, not shown: `bridal-2024-01`, `bridal-2024-02`, and `bridal-2024-03` (JPEG and WebP). Those three files were 640×640 slices of wider composites, so a person was cut through the middle in the file itself. They are not in the gallery, services, lightbox, or `og.jpg`.

`og.jpg` is a preview card made from Desiree’s own portrait. `favicon.svg` / `favicon.png` are a plain double-line mark for the browser tab, not her logo.

The four client photographs and Desiree’s portrait are shown at their natural shape: `width: 100%` and `height: auto`. Gallery frames are at most 340px wide on small screens and 420px on desktop. Nothing uses `object-fit: cover`.

### Kind words, verbatim

Attributed only as “Bridal client, via Instagram.”

- “Thank you so much!! You made me feel and look so amazing🤍🤍”
- “You truly are amazing! Thank you 🤍”
- “Thank you so much you did an amazing job”

Other commenters (photographers and other accounts) are not quoted, so a non-client is not called a bridal client.

## Placeholder, not a fact

- Every dollar amount (`$___`), including travel, tax, deposit, and balance.
- Deposit rules, cancellation, late arrival, payment method, parking, what the room should have, response time, hours, and whether a preview holds the wedding date.
- The 15 / 75 / 45 minute timeline. It exists only so the preview can suggest a start time. The page says it is not her timing.
- The early-morning note (sample start before 8:00 a.m.).
- Whether she offers hair. One post credited hair to a collaborator. The page does not say she does, or does not, offer it.
- Phone, email, and studio address. A line says they were not on the public Instagram profile on 12 Nov 2026.
- The rest of her biography past the captured bio line.
- The fourth “kind words” card.
- The preview calendar. It is not her availability. A past date is refused. Any other date is “shown as open in this preview.”

## Booking demo

Seven steps, then a deposit moment, then a confirmation: Service, Date, Party, Place, Ready by, Brief, Estimate. Nothing is posted. There is no `fetch`, no form action, and no payment field. Finish clears the inputs and shows “Demo only — no booking or payment was made.”

Entry links: `book/?door=weddings`, `book/?door=events`, `book/?service=bridal`, `preview`, `prom`, `shoot`, `event`. `party=1` and `mothers=1` only pre-fill counters.

## Demo behaviour

- Customer-facing credit is “1APP” on the banner and the footer footnote. HighLevel / GHL are not named.
- Fonts are self-hosted latin subsets (Cormorant Garamond, DM Sans, IBM Plex Mono) so the page does not call Google Fonts at runtime. License: `assets/fonts/OFL.txt`.
