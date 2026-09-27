# Astro Port Plan

Porting the Gatsby portfolio (repo root) to Astro. Everything for the port lives in
this `astro-port/` directory. Add new goals to the bottom of the list below.

## Goals

### 1. Keep the hover animation

The projects section rows grow on hover and reveal the description, tech stack
and GitHub link.

- [x] Extract the animation into a reusable file → `animations/hover-expand.module.css`
- [x] Use it in the Astro project card component → `src/components/Project.tsx` (Preact),
      copied to `src/animations/hover-expand.module.css` with `:focus-within` for keyboard users

Usage in a `.astro` file:

```astro
---
import expand from '../animations/hover-expand.module.css';
---
<div class={expand.container} style={{ '--expand-expanded-height': '400px' }}>
  <span>Always visible</span>
  <p class={expand.reveal}>Shown on hover</p>
</div>
```

Settings (CSS custom properties): `--expand-collapsed-height` (100px),
`--expand-expanded-height` (400px), `--expand-duration` (0.75s), `--expand-easing` (ease).

### 2. Extract all displayed information so it can be ported

- [x] Build the extractor → `extract/extract.mjs`
- [ ] Fix the problems listed in `extracted/REPORT.md` (in the Gatsby source, then rerun)
      — Gatsby source isn't in this folder. Until it's fixed, `src/content.config.ts` drops
      non-URL `link` values so no broken GITHUB/credential links render.
- [x] Copy `extracted/content/*` into the Astro project's `src/content/`
- [x] Rebuild the pages from `extracted/pages/*.json` and `extracted/site.json`
      (`/navbar` skipped; `/contact-me` retitled "Contact Me")

Run it from the repo root (it uses the Gatsby repo's `node_modules`):

```sh
node astro-port/extract/extract.mjs
```

It regenerates `extracted/` on every run. Don't edit files there by hand.

| Output | Contents | Use in Astro |
| --- | --- | --- |
| `content/projects/*.md` | Project frontmatter (title, date, year, technologies, link) + description | `src/content/projects/` collection |
| `content/certificates/*.md` | Certificate frontmatter (issuer, dateAcquired, expirationDate, link) + body | `src/content/certificates/` collection |
| `content/*.json` | Same data as one JSON array per collection | Quick reference, or import directly |
| `site.json` | Site title/URL, fonts, routes + page titles, nav links | Layout, `<head>`, nav, `astro.config` |
| `pages/*.json` | Hardcoded text (with line breaks), links and images per page | Page content |
| `pages/components/*.json` | Same, for each component; `{placeholders}` mark dynamic values | Component templates |
| `assets/images/` | Copies of `src/images` | `src/assets/` |
| `styles/` | Copies of every CSS file | Restyling reference |
| `REPORT.md` | Counts, routes and data problems found | Fix list |

Known issues it flags today:
- Project `link` values are `blightl` / `blightjl`, not URLs, so the GITHUB links are broken.
- Certificate files use `date-acquired` / `expiration-date`, but the Gatsby page reads
  `date_acquired` / `expiration_date`, so the dates show blank on the live site. The
  extractor reads both spellings and writes `dateAcquired` / `expirationDate`.
- `siteUrl` is still the Gatsby placeholder.
- `/navbar` exists as a page only because `navbar.tsx` sits in `src/pages`; skip it in Astro.
- `/contact-me` has the title "Home Page" and only shows the profile picture.

<!-- Add the next goal below as "### 3. ..." -->
