# Josan's Portfolio

Astro + Preact port of the Gatsby portfolio. See `astro-port/PLAN.md` for the port checklist.

Pages are Astro; UI components are Preact. Everything renders to static HTML, and only the
certificate viewer on `/certificates` ships JavaScript (`client:load`).

## Project Structure

```text
src/
├── animations/hover-expand.module.css   # project-row hover animation
├── assets/images/                       # profile picture + unused Gatsby icons
├── components/                          # Preact components (+ ProfilePicture.astro)
├── content/
│   ├── projects/*.md                    # one file per project
│   └── certificates/*.md                # one file per certificate
├── content.config.ts                    # collection schemas
├── consts.ts                            # site title, description, nav links
├── layouts/Layout.astro                 # <head>, header, navigation
├── pages/                               # /, /projects, /certificates, /contact-me, 404
└── styles/                              # global.css + CSS modules per component/page
```

To add a project or certificate, add a Markdown file to the matching `src/content/` folder.
Project `link` and certificate `link` must be full `https://` URLs; anything else hides the link.

## Commands

| Command           | Action                                      |
| :---------------- | :------------------------------------------ |
| `npm install`     | Installs dependencies                       |
| `npm run dev`     | Starts local dev server at `localhost:4321` |
| `npm run build`   | Builds the production site to `./dist/`     |
| `npm run preview` | Previews the build locally                  |
| `npm run deploy`  | Builds and uploads `dist/` to Cloudflare Pages |

## Deploying to Cloudflare Pages

The site is fully static, so no adapter is needed. Pages serves `dist/404.html` for unknown routes
and applies `public/_headers` (long-lived caching for `/_astro/*`).

- **From the CLI:** `npx wrangler login` once, then `npm run deploy`. If the project doesn't exist yet, wrangler
  offers to create `josan-portfolio` (the `name` in `wrangler.jsonc`).
- **From Git:** in the Cloudflare dashboard, create a Pages project from the repo with build command
  `npm run build` and output directory `dist`. `.node-version` pins Node 22 for the build.
