# Source notes (not linked from the demo)

Internal notes for review. This file is not in the site navigation.

Collected 13 Nov 2026. Facebook page content is from the project notes (signed-in, read-only). The public web footprint is from the project footprint file. Nothing on the customer-facing pages was copied from another cleaning company’s site. Research on other cleaners informed layout only.

## Where it lives

- Files live only in `kawartha-clean-queens-demo/`.
- `noindex, nofollow` on every HTML page.
- Not added to `sitemap.xml` or `robots.txt`. Not linked from the main site nav.
- Nothing under `r/` was changed. Other demo folders were not changed.
- Links inside the demo are relative, so the folder works at `/kawartha-clean-queens-demo/`.
- The platform is named 1APP. The banner and footer say “Demo website prepared by 1APP, preview only.”

## Verified and shown

- Name: Kawartha Clean Queens. Category: Cleaning Service. Facebook page, 13 Nov 2026.
- Location shown: Bobcaygeon, Ontario. Facebook page location. No street address is published on the page.
- Phone: +1 705-957-1977. Displayed as (705) 957-1977. Email: kcleanqueens@gmail.com.
- Facebook: https://www.facebook.com/p/Kawartha-Clean-Queens-61555432545766/
- Instagram: https://www.instagram.com/kaw.arthacleanqueens/ (handle spelling has a period after `kaw`). Logged-out Instagram showed the handle only. Follower counts are not on the page.
- Recommendations: “92% recommend (11 reviews)” on Facebook, 13 Nov 2026. Presented as a recommendation score, not a star rating.
- Slogan lines are from her services flyer, set in sentence case on the hero: “Let us clean, so you can relax.” and “A clean space makes a better place.” The pull quote “We don’t cut corners. We clean them.” and the closing “Sparkling clean. Stress free.” / “Book your clean today.” are also from that flyer. The page says so.
- Services named from the flyer: Residential, Deep, Move In / Move Out, Office & Commercial, Recurring & One-Time, Airbnbs, Customized Cleaning Plans.
- Also named from posts: post-rental turnovers, renovation and post-construction cleaning, window cleaning (16 Sep 2026, 17 Sep 2026, 8 Mar 2026).
- CommunityVotes, without linking the Peterborough profile: weekly, biweekly, or monthly scheduling; Kawarthas profile service area “Kawartha Lakes, Bobcaygeon, and Omemee.”
- Service area on the page: Bobcaygeon, Lindsay, Lakefield, Buckhorn (21 Sep 2026 Facebook post, plus Bobcaygeon as the page location), Omemee and Kawartha Lakes (Kawarthas CommunityVotes). “Surrounding areas” stays attributed to that post.
- Gift certificates: 13 Nov 2026 Facebook post. Amount of the customer’s choice. The graphic is shown small, not as a hero.
- Kind words are verbatim Facebook recommendations, first names only. Shown: Harrison, Nikki, Grace, Renee, Kelly, Scott, Angela, Jane.
- Not shown in Kind words, on purpose: the 26 Aug 2026 review (not a recommendation); the unnamed business review (it asserts awards and an owner relationship the page does not confirm); Jaxson’s “My mom” line (it does not name an owner). The 92% / 11 reviews figure stays, so the page does not pretend every review is quoted.
- About is written as the team. Ashley is mentioned only as wording inside Renee’s review, with a note that it does not name the owner.
- 26 Oct 2026 post: one crew on Airbnb and renovation cleans, then a second crew on a commercial clean. Used as a fact about the work, not as a staff count.
- 21 Sep 2026: accepting new clients, and a separate note that morning residential cleans in Bobcaygeon had space. Both are dated on the page, not treated as a live opening list.
- Hours: Facebook says “Always open.” The page does not use that as business hours. A footer line is marked placeholder. The careers page says it is not a shift schedule.

### Photographs used

Optimized to JPEG and WebP. Hero also has a smaller mobile file. Photos are shown at their own shape (`height: auto`), not cropped to fill a frame, except the tiny photo-request thumbnails.

| File | Use |
|---|---|
| `logo` | Header, favicon crop of the house mark, Open Graph card. Facebook profile photo. |
| `window-exterior` | Hero and gallery. 17 Sep 2026 window post. |
| `bathroom-finished` | Services band and gallery. Post the viewer dated 9 Aug, year not shown. |
| `kitchen-clean` | Services band and gallery. Same post. Cleaner seen from behind. |
| `open-plan` | Gallery. Same post. During a post-renovation clean. |
| `hallway` | Gallery. Post the viewer dated 9 Sep, year not shown. |
| `bathroom-detail`, `reno-room`, `reno-hall`, `commercial-floor` | Gallery. 21 Oct 2026 post-rental / post-construction set. |
| `gift-certificate` | Small gift section only. 13 Nov 2026. |
| `og.jpg` | Share card made from the window photo plus her logo. |
| `qr-book.svg`, `qr-careers.svg` | Drawn locally with the Python `segno` library. They point at `/book/?src=qr` and `/careers/?src=qr` on this preview. |

Not used, and not committed: the services flyer graphic, the Facebook cover collage, the window close-up (a person is reflected in the glass), and the lakeside living room (a real-estate sign in the glass shows someone else’s name and phone number).

## Placeholder, not a fact

- The what’s-included checklist. Labelled on the page. It is not her list.
- Add-ons in the quote form (oven, fridge, windows, cabinets, laundry, baseboards, appliance exteriors). Options to discuss. No prices.
- Owner name, owner photo, and origin story.
- Pay, benefits, and working hours. No hiring post was visible on 13 Nov 2026. The careers page says hiring status is unconfirmed.
- FAQ answers for supplies, being home, insurance or bonding, pets policy, payment, and cancellation.
- Hours.
- Anything about insurance, bonding, licences, eco-friendly products, a satisfaction guarantee, years in business, staff counts, or awards. Flyer lines and CommunityVotes marketing lines that say those things were not repeated as facts. CommunityVotes “winner” placements were left off. They conflict with the profiles’ own “no nominations” note and are not newspaper awards.
- The 721 Rye Street, Peterborough address. Not used. `cleanqueens.ca` is a different company and is not used.

## Quote request and careers

Nine short steps, then a confirmation: service, property and size, frequency, add-ons, preferred timing, town and address, pets / entry / optional photos, contact, review. A gift certificate skips the home steps and goes to contact. Nothing is posted. There is no `fetch`, no form action, and no payment field. Finish shows “Demo only: nothing was sent.” and explains that the live version would email kcleanqueens@gmail.com and confirm to the customer.

The careers form collects name, phone, email, availability, full-time or part-time preference, cleaning experience, and a note. Same demo confirmation.

Entry notes that look like alarm codes, lockbox codes, or passwords are refused on the page. Photos selected in the browser are previewed locally and discarded. They are not uploaded.
