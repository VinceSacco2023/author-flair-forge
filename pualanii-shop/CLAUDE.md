# Pualanii Village Domes — shop page

Static one-page shop (HTML/CSS/vanilla JS, no build step) that sends buyers to the Wix store for checkout. Deployed to Hostinger.

## Files

- `index.html` — the page. Product data lives in ONE block: the `<ul class="product-grid">` in the "Featured products" section.
- `css/styles.css` — all styles. Tokens (colors, spacing, type) on `:root`; dark mode redefines the same tokens.
- `js/main.js` — footer year only. One IIFE, `'use strict'`.
- `privacy.html`, `robots.txt`, `sitemap.xml`
- `img/` — optimized images only (WebP; hero ≤ 200 KB, others ≤ 120 KB). Current images are labeled PLACEHOLDERs.

## Non-negotiable content rules

- Never invent facts: no reviews, ratings, sales numbers, certifications, statistics or testimonials.
- Environmental claims: only material names exactly as on the supplier spec ("organic cotton"). No "eco-friendly", "sustainable", "carbon neutral" or numbers without an owner-provided source (FTC Green Guides).
- Proceeds claim stays as `[PROCEEDS CLAIM — CONFIRM]` until the owner confirms it in writing.
- Prices must match the Wix store. If unsure, hide the price.
- Brand name is always "Pualanii Village Domes" (never "EcoPualaniiFund").
- Location: "Floyd County, Virginia". No street address.
- Unknown values go in as `[PLACEHOLDER — DESCRIPTION]`.
- Every product button says "Shop now" and opens in the same tab.
- Don't change owner-approved copy; fix typos only and flag them.

## Design / code rules

- Mobile-first, `min-width` queries. Product grid: 1 col < 600, 2 cols 600–1023, 3 cols ≥ 1024.
- Spacing only from the scale 4/8/16/24/32/48/64/96 (`--s-1`…`--s-8`).
- One button style (`.btn`, accent color). Accent color is for buttons only.
- Tap targets ≥ 44×44, visible hover and focus states. Respect `prefers-reduced-motion`.
- Every `<img>` has width, height, alt. Below-the-fold images `loading="lazy"`; hero is not lazy and is preloaded.
- No inline styles except the critical hero CSS in `<head>`. Scripts use `defer`.
- No new dependencies, frameworks or build tools without asking the owner.
- No console logs or dead code.

## Waitlist

Owner decision: sign-ups are collected by a Wix Forms page on pualaniivillagedomes.com, so Wix stores contacts and sends email. This page has no form — the "Join the waitlist" button links to that Wix page (`#placeholder-wix-waitlist-url` until the owner sends the URL). Don't add a form backend or API keys here.

## Before saying "done"

Check the Definition of Done list in the owner's brief: all 8 sections, links, prices, placeholders listed, W3C-valid HTML, Lighthouse mobile (Perf ≥ 90, A11y ≥ 95, BP ≥ 95, SEO ≥ 95), no horizontal scroll at 360/768/1440, keyboard navigation, waitlist button opens the Wix form, share preview.
