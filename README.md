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
