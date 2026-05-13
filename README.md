# Write Off Whiz — website

Static site for **Write Off Whiz** (a division of Horizon Automotive Solutions Inc.): HTML, CSS, and vanilla JS. The contact form posts to **[Formspree](https://formspree.io/)** (no Node server). Host anywhere that serves static files — **Render Static Site**, Netlify, GitHub Pages, S3, etc.

## File layout

```
index.html       All page content + Formspree form `action` URL
styles.css       Theme, layout, responsive styles
script.js        Nav, reveal-on-scroll, Formspree fetch submit
assets/          Images, favicons, manifest
```

## Contact form (Formspree)

1. In the [Formspree dashboard](https://formspree.io/), create a form and copy its endpoint (looks like `https://formspree.io/f/abcdefgh`).
2. In **`index.html`**, find the contact `<form id="contact-form">` and set **`action="https://formspree.io/f/YOUR_ID"`** (replace `REPLACE_ME` with your real form ID).
3. The script submits with **`fetch`** + **`Accept: application/json`** so the page stays put and shows success/error text.
4. **Honeypot:** the hidden field **`name="_gotcha"`** is Formspree’s spam field — leave it as-is (empty).
5. **Optional file** (`valuation_report`): Formspree only accepts file uploads on **paid plans** that include attachments (see [Formspree file uploads](https://help.formspree.io/articles/building-your-form/file-uploads)). On Free, omit the file input or leave it — if a user attaches a file and your plan rejects it, Formspree will return an error you can fix by upgrading or removing the field.

**Subject line:** the script appends **`_subject`** as `Free case review — {name}` so inbox threads are easy to scan.

## Run locally

```bash
python -m http.server 8080
# or: npx serve .
```

Open http://localhost:8080 — the form still POSTs to Formspree on the internet (needs your real `action` URL).

## Editing copy

Almost all text lives in `index.html`. Section landmarks:

- **Hero** — `<section class="hero">`
- **Don'ts** — `<section ... id="donts">`
- **Process** — `<section ... id="process">`
- **Fees** — `<section ... id="fees">`
- **Results** — `<section ... id="results">`
- **Horizon callout** — `<aside class="horizon-card">`
- **Contact + form** — `<section ... id="contact">`
- **Footer** — `<footer class="site-footer">`

## Deploy

### Render (Static Site)

1. New **Static Site** → connect the repo. Build and publish the root (no build command required, or `echo` no-op).
2. Set your custom domain if needed.
3. Ensure **`index.html`** already uses your live Formspree `action` URL (HTTPS).

### Netlify / Cloudflare Pages / GitHub Pages

Connect the repo; publish directory = project root. Same Formspree `action` works from any static host.

## SEO checklist

- [x] Title + meta description
- [x] Open Graph + Twitter card meta
- [x] JSON-LD `ProfessionalService` schema
- [x] Canonical URL (update once the real domain is live)
- [ ] Add `assets/og-image.png` (1200×630) — used by Facebook, LinkedIn, iMessage, etc.
- [ ] Add `assets/apple-touch-icon.png` (180×180)
- [ ] Submit `sitemap.xml` to Google Search Console once domain is live
- [ ] Add Google Analytics or Plausible script before `</head>` if desired

## Voice & language notes

- The site uses **first-person ("I")** consistently to reflect that Manny personally handles every case. A couple of spots use "I/we" only where it's the most natural way to describe the work — those can be flipped to "I" everywhere if you want strict consistency.
- Language deliberately covers **both total losses _and_ thefts**, since theft of higher-value vehicles is a key target market.
- "Total loss" is preferred over "totaled" everywhere (totaled implies a collision; total loss covers both write-offs and unrecovered thefts).
