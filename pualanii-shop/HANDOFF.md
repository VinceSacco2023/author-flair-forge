# Handoff — Pualanii Village Domes shop page

## What was built
Static one-page shop in this folder: hero, story, 6 product cards, why it matters, build progress, waitlist (links to a Wix form), FAQ, footer. Also privacy.html, robots.txt, sitemap.xml, CLAUDE.md. No frameworks or build step.

Checked locally (headless Chromium):
- W3C Nu validator (vnu.jar): 0 errors on index.html, privacy.html, styles.css
- Lighthouse mobile: Performance 98, Accessibility 100, Best Practices 100, SEO 100 (LCP 1.3 s, CLS 0, page weight 71 KiB with placeholder images)
- No horizontal scroll at 360 / 390 / 768 / 1024 / 1440 px, light and dark mode
- Product grid 1 / 2 / 3 columns at the required breakpoints
- Keyboard: skip link works, logical tab order, visible focus
- All 6 "Shop now" links point at the exact Wix URLs and open in the same tab

Not checked: live share preview (needs the site online — test with the Facebook Sharing Debugger / LinkedIn Post Inspector after deploy). Prices could NOT be verified against the Wix store (it was unreachable from the build environment).

## Open placeholders (search the files for "[")
1. All images in img/ are labeled placeholders — hero, story photo, 6 product photos, 4 build photos, og-image.jpg (1200×630), logo.png. Replace with real photos at the same file names and sizes (hero ≤ 200 KB, others ≤ 120 KB, WebP).
2. Alt text for hero, story and the 4 build photos.
3. [STORY — OWNER TO WRITE …] in the Story section.
4. [PROCEEDS CLAIM — CONFIRM] — hero subhead and "Part of the build". Needs written confirmation.
5. [CHECK — CONFIRM MATERIALS AGAINST SUPPLIER SPEC] — organic cotton line in "Why it matters".
6. [MONTH YEAR — BUILD PHOTO 1–4] captions.
7. [STAY OPENING DATE — ASK OWNER] in the FAQ.
8. [SHIPPING & RETURNS URL — ASK OWNER] — FAQ and footer (links currently go to #placeholder-shipping-url).
9. [INSTAGRAM URL — ASK OWNER] — footer link and JSON-LD sameAs.
10. [CONTACT EMAIL] — footer and privacy.html.
11. Water bottle price — hidden ("See price in store") until confirmed.
12. [WIX WAITLIST PAGE URL — ASK OWNER] — the "Join the waitlist" button points at #placeholder-wix-waitlist-url (see below).
13. privacy.html: [DATE]. Make the "What we collect" list match the fields on the Wix form. Owner should also confirm the lines "We do not sell your information" and "We will delete your details".
14. Canonical / OG / sitemap URLs assume https://shop.pualaniivillagedomes.com/ — change if the live address differs.

## Decisions for the owner
- Prices $39 / $75 / $42 / $40 / $49 are shown as given in the brief. Please confirm they match Wix today.
- Product JSON-LD was left out until prices are confirmed.
- The hoodie's product name contains "eco" (it matches the Wix product name). Under the FTC Green Guides an unqualified "eco" can be read as a general environmental claim — worth reviewing on the Wix side.
- No web font: system fonts are used, so there is no font to preload. Say if you want a brand font.
- No analytics added (brief says ask first). Product links carry data-product attributes ready for click tagging.

## Waitlist (Wix)
Decision: Wix collects sign-ups, so contacts and emails live in Wix.
1. In the Wix Editor, add a page (for example /waitlist) with a Wix Forms form: Name, Email, and a required checkbox "Yes, email me about stays and new products. I can unsubscribe anytime." Turn on the setting that adds submitters to your Wix contacts / email subscribers.
2. Publish the Wix site, then put that page's URL in index.html in place of `#placeholder-wix-waitlist-url` and delete the "[WIX WAITLIST PAGE URL — ASK OWNER]" note.
3. Send the emails from Wix (Email Marketing), which includes an unsubscribe link.
Exact Wix menu names were not checked from here — follow Wix's current Help Center wording.

## Deploy to Hostinger
1. hPanel → Files → File Manager → open public_html (or the subdomain's folder).
2. Upload everything in this folder except CLAUDE.md and HANDOFF.md.
3. For shop.pualaniivillagedomes.com: create the subdomain in Hostinger, then add the DNS record Hostinger shows (usually a CNAME or A record) wherever the domain's DNS is managed (Wix). Don't touch the existing records the main Wix site uses — confirm with the owner first.
4. Turn on SSL for the subdomain in hPanel and wait for it to issue before sharing the link.
5. After it's live: check the share preview, submit sitemap.xml in Google Search Console.
