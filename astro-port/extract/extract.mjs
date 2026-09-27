/*
 * Extracts everything the Gatsby portfolio displays into Astro-friendly files.
 *
 * Run from anywhere (uses the Gatsby repo's node_modules):
 *   node astro-port/extract/extract.mjs
 *
 * Output (regenerated on every run) goes to astro-port/extracted/:
 *   content/projects/*.md      -> drop into Astro src/content/projects/
 *   content/certificates/*.md  -> drop into Astro src/content/certificates/
 *   site.json                  site metadata, fonts, routes, page titles, nav links
 *   pages/*.json               hardcoded text, links and images per page/component
 *   assets/images/             copies of src/images
 *   styles/                    copies of every CSS file (reference for restyling)
 *   REPORT.md                  summary + data problems found while extracting
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import ts from 'typescript';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const OUT = path.resolve(HERE, '../extracted');

const warnings = [];
const warn = (msg) => warnings.push(msg);

const rel = (p) => path.relative(REPO, p);
const writeJson = (file, data) => write(file, JSON.stringify(data, null, 2) + '\n');
function write(file, contents) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, contents);
}
function listFiles(dir, predicate = () => true) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return listFiles(full, predicate);
        return predicate(full) ? [full] : [];
    });
}
const isUrl = (value) => /^https?:\/\//.test(value ?? '');

// ---------------------------------------------------------------------------
// MDX content -> Astro content collections
// ---------------------------------------------------------------------------

// Keeps .mdx only when the body actually uses MDX features.
function contentExtension(body) {
    return /^\s*(import|export)\s|<[A-Z]/m.test(body) ? '.mdx' : '.md';
}

// Accepts snake_case, kebab-case and camelCase spellings of a frontmatter key.
function pick(data, camelKey) {
    const snake = camelKey.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
    const kebab = snake.replace(/_/g, '-');
    for (const key of [camelKey, snake, kebab]) {
        if (data[key] !== undefined) return data[key];
    }
    return undefined;
}

function extractCollection(name, normalize) {
    const files = listFiles(path.join(REPO, name), (f) => /\.mdx?$/.test(f)).sort();
    const entries = files.map((file) => {
        const { data, content } = matter(fs.readFileSync(file, 'utf8'));
        const body = content.trim();
        const slug = path.basename(file).replace(/\.mdx?$/, '');
        const frontmatter = normalize(data, rel(file));
        write(
            path.join(OUT, 'content', name, slug + contentExtension(body)),
            matter.stringify(body + '\n', frontmatter),
        );
        return { slug, source: rel(file), ...frontmatter, body };
    });
    writeJson(path.join(OUT, 'content', `${name}.json`), entries);
    return entries;
}

function normalizeProject(data, source) {
    const date = data.date ? new Date(data.date) : null;
    if (!date || isNaN(date)) warn(`${source}: missing or invalid \`date\` (${data.date})`);
    if (!isUrl(data.link)) {
        warn(`${source}: \`link\` is "${data.link}", not a URL — the GITHUB link on the site is broken`);
    }
    for (const key of ['title', 'technologies']) {
        if (data[key] === undefined) warn(`${source}: missing \`${key}\``);
    }
    return {
        title: data.title ?? '',
        date: date && !isNaN(date) ? date.toISOString().slice(0, 10) : '',
        year: date && !isNaN(date) ? date.getUTCFullYear() : null,
        technologies: data.technologies ?? [],
        link: data.link ?? '',
    };
}

function normalizeCertificate(data, source) {
    // The Gatsby page queries date_acquired / expiration_date; flag files that
    // use other spellings since those values never reach the page.
    for (const key of ['date_acquired', 'expiration_date']) {
        if (data[key] === undefined && data[key.replace('_', '-')] !== undefined) {
            warn(`${source}: uses \`${key.replace('_', '-')}\` but the site queries \`${key}\` — this date is blank on the live site`);
        }
    }
    if (!isUrl(data.link)) warn(`${source}: \`link\` is "${data.link}", not a URL`);
    return {
        issuer: data.issuer ?? '',
        dateAcquired: pick(data, 'dateAcquired') ?? '',
        expirationDate: pick(data, 'expirationDate') ?? '',
        link: data.link ?? '',
    };
}

// ---------------------------------------------------------------------------
// Hardcoded JSX -> text blocks, links, images
// ---------------------------------------------------------------------------

const LINK_ATTRS = ['to', 'href'];
const IMAGE_TAGS = new Set(['img', 'StaticImage', 'GatsbyImage']);

function tagName(node) {
    const opening = ts.isJsxElement(node) ? node.openingElement : node;
    return opening.tagName.getText();
}

function attributes(node, sf) {
    const opening = ts.isJsxElement(node) ? node.openingElement : node;
    const attrs = {};
    for (const prop of opening.attributes.properties) {
        if (!ts.isJsxAttribute(prop)) continue;
        const name = prop.name.getText(sf);
        const init = prop.initializer;
        if (!init) attrs[name] = true;
        else if (ts.isStringLiteral(init)) attrs[name] = init.text;
        else if (init.expression) attrs[name] = `{${init.expression.getText(sf)}}`;
    }
    return attrs;
}

// Mirrors JSX whitespace rules: multi-line text is trimmed per line and joined.
function jsxText(raw) {
    if (!raw.includes('\n')) return raw;
    return raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).join(' ');
}

// Text made of an element's direct children; <br /> becomes a newline and
// dynamic expressions are kept as {placeholders}.
function directText(node, sf) {
    let text = '';
    let dynamic = false;
    for (const child of node.children) {
        if (ts.isJsxText(child)) text += jsxText(child.text);
        else if (ts.isJsxSelfClosingElement(child) && tagName(child) === 'br') text += '\n';
        else if (ts.isJsxExpression(child) && child.expression) {
            const expr = child.expression;
            if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) text += expr.text;
            else if (!ts.isJsxElement(expr) && !ts.isJsxFragment(expr) && !expr.getText(sf).startsWith('/*')) {
                text += `{${expr.getText(sf)}}`;
                dynamic = true;
            }
        }
    }
    text = text.split('\n').map((l) => l.replace(/[ \t]+/g, ' ').trim()).join('\n').trim();
    return { text, dynamic };
}

function extractJsx(file) {
    const source = fs.readFileSync(file, 'utf8');
    const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const result = { source: rel(file), title: null, text: [], links: [], images: [] };

    const visit = (node) => {
        if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
            const tag = tagName(node);
            const attrs = attributes(node, sf);
            const { text, dynamic } = ts.isJsxElement(node) ? directText(node, sf) : { text: '' };

            if (tag === 'title' && text) result.title = text;
            else if (text) {
                const block = { tag, text };
                if (attrs.className) block.className = attrs.className;
                if (dynamic) block.dynamic = true;
                result.text.push(block);
            }
            for (const attr of LINK_ATTRS) {
                if (attrs[attr]) result.links.push({ label: text || null, [attr]: attrs[attr], ...(attrs.target && { target: attrs.target }) });
            }
            if (IMAGE_TAGS.has(tag) && attrs.src) {
                const src = attrs.src.startsWith('{') ? attrs.src : rel(path.resolve(path.dirname(file), attrs.src));
                result.images.push({ src, alt: attrs.alt ?? null });
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(sf);
    return result;
}

// Evaluates plain literal values from gatsby-config.ts without running it.
function literalValue(node) {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
    if (ts.isNumericLiteral(node)) return Number(node.text);
    if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
    if (ts.isArrayLiteralExpression(node)) return node.elements.map(literalValue);
    if (ts.isObjectLiteralExpression(node)) {
        return Object.fromEntries(node.properties
            .filter(ts.isPropertyAssignment)
            .map((p) => [p.name.getText().replace(/['"]/g, ''), literalValue(p.initializer)]));
    }
    return `{${node.getText()}}`;
}

function extractGatsbyConfig() {
    const file = ['gatsby-config.ts', 'gatsby-config.js'].map((f) => path.join(REPO, f)).find(fs.existsSync);
    const config = { siteMetadata: {}, fonts: [] };
    if (!file) return config;
    const sf = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
    const visit = (node) => {
        if (ts.isPropertyAssignment(node)) {
            const name = node.name.getText(sf);
            if (name === 'siteMetadata') config.siteMetadata = literalValue(node.initializer);
            if (name === 'families') config.fonts.push(...literalValue(node.initializer));
        }
        ts.forEachChild(node, visit);
    };
    visit(sf);
    if (config.siteMetadata.siteUrl?.includes('yourdomain')) {
        warn('gatsby-config: `siteUrl` is still the Gatsby placeholder — set the real domain in astro.config');
    }
    return config;
}

function routeFor(pageFile) {
    const name = path.relative(path.join(REPO, 'src/pages'), pageFile).replace(/\.(t|j)sx?$/, '');
    return name === 'index' ? '/' : '/' + name.replace(/\/index$/, '');
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

fs.rmSync(OUT, { recursive: true, force: true });

const projects = extractCollection('projects', normalizeProject);
const certificates = extractCollection('certificates', normalizeCertificate);

const isTsx = (f) => /\.(t|j)sx$/.test(f);
const pageFiles = listFiles(path.join(REPO, 'src/pages'), isTsx);
const componentFiles = listFiles(path.join(REPO, 'src/components'), isTsx);

const pages = pageFiles.map((file) => ({ route: routeFor(file), ...extractJsx(file) }));
const components = componentFiles.map(extractJsx);

for (const page of pages) {
    writeJson(path.join(OUT, 'pages', path.basename(page.source).replace(/\.\w+$/, '.json')), page);
}
for (const component of components) {
    writeJson(path.join(OUT, 'pages/components', path.basename(component.source).replace(/\.\w+$/, '.json')), component);
}

const navComponent = components.find((c) => c.source.endsWith('navigation.tsx'));
const gatsbyConfig = extractGatsbyConfig();
writeJson(path.join(OUT, 'site.json'), {
    ...gatsbyConfig,
    routes: pages.map(({ route, title, source }) => ({ route, title, source })),
    navigation: navComponent?.links ?? [],
});

const imageFiles = listFiles(path.join(REPO, 'src/images'));
for (const file of imageFiles) {
    const dest = path.join(OUT, 'assets/images', path.relative(path.join(REPO, 'src/images'), file));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(file, dest);
}
const referenced = new Set([...pages, ...components].flatMap((p) => p.images.map((i) => i.src)));
for (const file of imageFiles) {
    if (!referenced.has(rel(file))) warn(`${rel(file)}: not referenced by any page (copied anyway)`);
}

const styleFiles = listFiles(path.join(REPO, 'src'), (f) => f.endsWith('.css'));
for (const file of styleFiles) {
    const dest = path.join(OUT, 'styles', path.relative(path.join(REPO, 'src'), file));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(file, dest);
}

const report = `# Extraction report

Generated by \`astro-port/extract/extract.mjs\`. Do not edit — rerun the script instead.

| What | Count | Output |
| --- | --- | --- |
| Projects | ${projects.length} | \`content/projects/\` |
| Certificates | ${certificates.length} | \`content/certificates/\` |
| Pages | ${pages.length} | \`pages/\` |
| Components | ${components.length} | \`pages/components/\` |
| Images | ${imageFiles.length} | \`assets/images/\` |
| Stylesheets | ${styleFiles.length} | \`styles/\` |

## Routes

${pages.map((p) => `- \`${p.route}\` — ${p.title ?? '(no title)'} (${p.source})`).join('\n')}

## Problems found (${warnings.length})

${warnings.length ? warnings.map((w) => `- ${w}`).join('\n') : 'None.'}
`;
write(path.join(OUT, 'REPORT.md'), report);

console.log(`Extracted ${projects.length} projects, ${certificates.length} certificates, ` +
    `${pages.length} pages, ${components.length} components, ${imageFiles.length} images, ` +
    `${styleFiles.length} stylesheets -> ${rel(OUT)}`);
if (warnings.length) console.log(`${warnings.length} problem(s) found — see ${rel(path.join(OUT, 'REPORT.md'))}`);
