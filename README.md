# Write Off Whiz — website

Static, single-page site for **Write Off Whiz** (a division of Horizon Automotive Solutions Inc.). Plain HTML, CSS, and a tiny bit of vanilla JS — no build step, no dependencies. Drops onto any host (Netlify, Vercel, GitHub Pages, Cloudflare Pages, Replit, or just S3 + CloudFront).

## File layout

```
index.html      All page content
styles.css      Theme, layout, responsive styles
script.js       Sticky nav, mobile menu, reveal-on-scroll, contact form
assets/
  logo.svg              Wizard mascot (placeholder — replace with real artwork)
  favicon.svg           Browser tab icon
  apple-touch-icon.png  (optional — add a 180x180 PNG when ready)
  og-image.png          (optional — add a 1200x630 PNG when ready for social share previews)
```

## Run locally

Double-click `index.html`, or for a proper local server:

```bash
# Python (any 3.x)
python -m http.server 8080

# or Node
npx serve .
```

Then open http://localhost:8080.

## Editing copy

Almost all text lives in `index.html`. Section landmarks:

- **Hero** — `<section class="hero">`
- **Don'ts** — `<section ... id="donts">`
- **Process** — `<section ... id="process">`
- **Fees** — `<section ... id="fees">`
- **Results / testimonials** — `<section ... id="results">`
- **Horizon callout** — `<aside class="horizon-card">`
- **Contact + form** — `<section ... id="contact">`
- **Footer** — `<footer class="site-footer">`

### Replacing the wizard logo

Drop the real wizard artwork in at `assets/logo.svg` (keep the same filename) and every spot — header, hero, fees, footer — updates automatically. SVG is preferred; PNG works if you change the file extension references.

### Real testimonials

Open `index.html` and find the `results-grid`. Each `<article class="result-card">` has:

- Star count
- Quote
- Initials (`<span class="avatar">`) and `result-card__name` / `result-card__source`
- `result-card__win-amt` (the green "+$X,XXX" figure)

Duplicate the block to add more, delete blocks you don't want.

### Contact details

`hello@writeoffwhiz.com` is used in three places (header CTA → form, contact section button, footer). Search and replace if it changes. Add Manny's phone number in:

- The contact section (`<section ... id="contact">`) — drop a `tel:` button next to the email button.
- The footer's "Contact Manny" list.

## Wiring up the contact form for real

Right now the form opens the visitor's email client (mailto fallback). To get submissions delivered to an inbox or webhook, swap the JS handler in `script.js` for one of these:

### Option A — Formspree (fastest, free tier)

1. Create a form at https://formspree.io and copy your endpoint (looks like `https://formspree.io/f/abcdwxyz`).
2. In `index.html`, add `action` and `method` to the form:
   ```html
   <form class="contact-form" id="contact-form" action="https://formspree.io/f/abcdwxyz" method="POST" novalidate>
   ```
3. In `script.js`, replace the `window.location.href = href;` line with:
   ```js
   const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
   if (res.ok) { form.reset(); setStatus("Thanks — I'll reply within one business day.", 'success'); }
   else { setStatus('Something went wrong. Please email hello@writeoffwhiz.com directly.', 'error'); }
   ```
   And mark the submit handler `async`.

### Option B — Netlify Forms (zero config if you host on Netlify)

Add `data-netlify="true"` and a hidden `form-name` input to the `<form>`, then deploy. Netlify auto-creates the inbox.

### Option C — Web3Forms / Getform / Basin

Same idea — point `action` to their endpoint.

## SEO checklist

- [x] Title + meta description
- [x] Open Graph + Twitter card meta
- [x] JSON-LD `ProfessionalService` schema
- [x] Canonical URL (update once the real domain is live)
- [ ] Add `assets/og-image.png` (1200×630) — used by Facebook, LinkedIn, iMessage, etc.
- [ ] Add `assets/apple-touch-icon.png` (180×180)
- [ ] Submit `sitemap.xml` to Google Search Console once domain is live
- [ ] Add Google Analytics or Plausible script before `</head>` if desired

## Deploy

### Netlify (drag-and-drop)

1. Zip the project folder.
2. Visit https://app.netlify.com/drop and drop the zip.
3. Point your domain at the new Netlify site.

### Vercel

```bash
npm i -g vercel
vercel
```

### Cloudflare Pages / GitHub Pages

Push the folder to a Git repo, connect it in the dashboard, output directory = root.

## Voice & language notes

- The site uses **first-person ("I")** consistently to reflect that Manny personally handles every case. A couple of spots use "I/we" only where it's the most natural way to describe the work — those can be flipped to "I" everywhere if you want strict consistency.
- Language deliberately covers **both total losses _and_ thefts**, since theft of higher-value vehicles is a key target market.
- "Total loss" is preferred over "totaled" everywhere (totaled implies a collision; total loss covers both write-offs and unrecovered thefts).
