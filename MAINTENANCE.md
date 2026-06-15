# Nichekala Site — Maintenance Guide

A practical runbook for editing pages, publishing blogs, and avoiding the foot-guns specific to this codebase.

---

## 1. Project know-how

### Stack
- **Pure static HTML / CSS / JS** — no build step at deploy time.
- **SCSS source** in `scss/`. Compiled output is `css/style.css`. If you edit SCSS, recompile before deploying.
- **Hosting**: Hostinger (shared, Apache + `mod_rewrite`). Files live in `public_html/`.
- **Canonical domain**: `https://nichekala.in`. Staging: `https://nichekala.blackitechs.org`.
- **HTML lang**: `en-IN` (India locale signal — keep it that way).

### Folder layout
```
.
├── index.html, about.html, contact.html, services.html, …   ← Root pages (extensionless URLs)
├── portfolio.html                ← Project LISTING page (a file, not a folder)
├── pockethome.html               ← Pocket Home landing page
├── blog.html                     ← Blog LISTING page
├── projects/                     ← Individual project case-study pages
├── blogs/                        ← Individual blog post pages
├── img/                          ← All images (use img/blog/ for blog hero shots)
├── css/, scss/                   ← Styles
├── js/                           ← Scripts
├── php/                          ← Server-side mailer (PHPMailer)
├── .htaccess                     ← Clean URLs, HTTPS, security headers
├── sitemap.xml                   ← Search-engine sitemap
├── robots.txt                    ← Crawler rules + AI crawler allowlist
├── llms.txt                      ← AI: short site index (one-line per page)
├── llms-full.txt                 ← AI: full content dump (paragraph per page)
└── 404.html                      ← Custom 404 (noindex, no canonical)
```

### Clean URLs — how they work
`.htaccess` does two things:
1. **Redirect** `/page.html` → `/page` (301)
2. **Internal rewrite** `/page` → serves `page.html`

So the canonical URL for `about.html` is `https://nichekala.in/about` (no extension). Every `<link rel="canonical">` and `<meta property="og:url">` tag on the site follows this format.

**Index page exception**: `index.html`'s canonical is the bare domain `https://nichekala.in/` — not `/index`.

### The collision rule (READ THIS)
**Never create a folder with the same name as a root `.html` page.**

If `about.html` exists, never create an `about/` folder. Apache's `DirectorySlash` adds a trailing slash → `/about/`, which has no directory index, and `Options -Indexes` is on → **404**. This exact bug caused the recent `portfolio/` → `projects/` rename: we had both `portfolio.html` (listing) and `portfolio/` (sub-pages), so `/portfolio` was unroutable.

**Pattern to follow**: listing page + folder must use different names.
- ✓ `portfolio.html` + `projects/`
- ✓ `blog.html` + `blogs/`
- ✗ `about.html` + `about/`

### SEO baseline that every page already has
- `<link rel="canonical">` — extensionless absolute URL
- Open Graph: `og:title`, `og:description`, `og:url`, `og:image`, `og:type`, `og:site_name`
- Twitter Card: `twitter:card=summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`
- JSON-LD `@graph` block with `Organization` + `LocalBusiness` + `WebSite` (shared across every page)
- Project pages additionally carry `CreativeWork` JSON-LD
- Blog posts additionally carry `Article` + `BreadcrumbList` JSON-LD

When you copy a page as a template, keep these blocks intact and update only the page-specific fields.

---

## 2. Workflow: changing a root page (home, about, contact, services, etc.)

### Before editing
- Branch from `main`. Never commit directly to `main` for non-trivial edits.
- Confirm the page's canonical URL — check `<link rel="canonical">` in the file.

### While editing
- Touch only what you need. Don't rewrite the `<head>` block — the SEO/JSON-LD tags there are deliberate.
- If you change copy that's also reflected in JSON-LD (e.g., page title), update the JSON-LD too.
- If you change image filenames, update both the `<img>` tag AND any `og:image` / JSON-LD `image` references.
- Keep `lang="en-IN"` on `<html>`.

### Cross-page consistency
The nav menu and footer appear on every page as inlined HTML (not a shared include). If you change a nav link, search the repo and update **every** page:

```
Grep: <a href="OLD_URL"
```

The same applies to phone number, address, social links, and copyright year.

### If you rename a page or change its URL
You must update **all** of these in the same commit:

1. `<link rel="canonical">` and `<meta property="og:url">` in the renamed page.
2. The JSON-LD `url` and `mainEntityOfPage` fields inside the page.
3. `sitemap.xml` — update the `<loc>` for that URL.
4. `llms.txt` — update the bullet line.
5. `llms-full.txt` — update the section heading link.
6. **Every nav/footer link** to the old URL, across all root pages and sub-pages.
7. `.htaccess` — add a 301 redirect from the old URL to the new one so inbound links and the search index keep working:
   ```apache
   Redirect 301 /old-page /new-page
   ```

### Test before deploy
- Open the edited HTML directly in a browser to catch obvious breakage.
- Run a local static server to test relative links: `python -m http.server 8000`. (Clean URLs won't work locally — those need Apache.)
- Push to **staging first** (`nichekala.blackitechs.org`). Click through every link on the edited page. Confirm no 404s.
- Inspect the page source: canonical, og:url, JSON-LD all correct.

### After production deploy
- Hard-reload (Ctrl+F5) — `.htaccess` caches assets for 1 year.
- If you changed `.htaccess`, confirm it uploaded (Hostinger File Manager hides dotfiles by default — toggle "Show hidden files").
- Smoke-test: open the page on a clean browser session, click every internal link, view-source the `<head>`.
- If URL structure changed, re-submit sitemap to Google Search Console.

---

## 3. Workflow: publishing a new blog post

A blog post is a standalone `.html` file in `blogs/`. Always start from an existing post as the template — don't write the `<head>` from scratch.

### Step 1 — Create the file
- **Path**: `blogs/<slug>.html`
- **Slug**: kebab-case, descriptive, no leading articles ("a"/"the").
- **Canonical URL**: `https://nichekala.in/blogs/<slug>` (no `.html`).
- **Template**: copy an existing post (e.g., `blogs/mastering-the-art-of-interior-design.html`) and edit.

### Step 2 — Hero image
- Save to `img/blog/<slug>.jpg` (or `.webp`).
- Target size: **1200 × 630** (Open Graph optimal), under 200 KB.
- Reference it in `og:image`, `twitter:image`, and JSON-LD `Article.image` as an **absolute URL**: `https://nichekala.in/img/blog/<slug>.jpg`.

### Step 3 — Update the `<head>` metadata
Replace these page-specific fields in the copied template:

| Tag | What to put |
|---|---|
| `<title>` | Under 60 chars. End with `| Nichekala`. |
| `<meta name="description">` | Under 160 chars. Compelling, includes the topic. |
| `<meta name="keywords">` | Comma-separated, location-relevant ("Chennai", etc.). |
| `<link rel="canonical">` | `https://nichekala.in/blogs/<slug>` (no `.html`). |
| `og:title`, `og:description` | Match `<title>` and `description`. |
| `og:url` | Same as canonical. |
| `og:image` | Hero image absolute URL. |
| `og:type` | `article` (already set in template). |
| `twitter:title`, `twitter:description`, `twitter:image` | Mirror OG. |

### Step 4 — Update the JSON-LD `Article` block
Inside the post's JSON-LD `<script>`, update:

- `headline` — match `<title>`.
- `image` — hero image absolute URL.
- `datePublished` — ISO 8601 (e.g., `2026-06-08`). **Don't fake the date** — it's used by search engines.
- `dateModified` — same as `datePublished` for a new post; bump on future edits.
- `author.name` — `Nichekala Architecture and Design Studio`.
- `mainEntityOfPage` — the canonical URL.
- `BreadcrumbList`: update the **third** item's `name` (post title) and `item` (canonical URL). Leave Home and Blog items alone.

### Step 5 — Write the body
- Use the existing post's structure: `<h1>` for the post title, `<h2>` for sections, `<p>` for paragraphs.
- Link to **at least one other blog post** and **at least one root page** (services, portfolio, contact) for internal SEO.
- Use **relative paths** for internal links (`../services.html`, `../blogs/other-post.html`) — not absolute URLs.
- The `<head>` uses `../css/style.css` and `../img/...` — keep that `../` prefix because blog posts are one level deep.

### Step 6 — Wire it into the site (DO NOT SKIP)
A new post file is invisible to readers and crawlers until you wire it up. Update all four of these:

| File | What to add |
|---|---|
| `blog.html` | A new blog card with thumbnail, title, snippet, and link to `blogs/<slug>.html`. Copy an existing card and edit. |
| `sitemap.xml` | `<url><loc>https://nichekala.in/blogs/<slug></loc><changefreq>monthly</changefreq><priority>0.6</priority></url>` |
| `llms.txt` | One bullet under "Editorial / Insights": `- [Title](https://nichekala.in/blogs/<slug>) — one-line summary` |
| `llms-full.txt` | One section under `# Editorial / Blog`: `## [Title](https://nichekala.in/blogs/<slug>)` + 2–3 sentence summary. |

### Step 7 — Test
- Open `blogs/<slug>.html` directly. Confirm CSS, images, and nav render.
- On staging, navigate from `blog.html` → confirm the new card appears and links correctly.
- DevTools → Elements → inspect `<head>`: canonical, og:url, JSON-LD all present and correct.
- Run the [Google Rich Results Test](https://search.google.com/test/rich-results) on the live URL — confirm `Article` and `BreadcrumbList` are detected with no errors.
- Share the URL in WhatsApp / LinkedIn / X — confirm the OG preview renders the hero image and title correctly.

### Step 8 — After deploy
- Hard-reload (Ctrl+F5).
- Ping Google Search Console → Sitemaps → re-submit `sitemap.xml`.
- Optionally: post the URL on social — the OG tags are set up for clean previews.

---

## 4. Quick reference

### Files to touch when a URL changes
- The page itself (canonical, og:url, JSON-LD url)
- `sitemap.xml`
- `llms.txt`
- `llms-full.txt`
- `.htaccess` (add 301 from old URL)
- Every nav/footer link site-wide (search for the old URL)

### Deploy via Hostinger
- File Manager → `public_html/` → upload changed files.
- For `.htaccess`: toggle **Show hidden files** in File Manager settings.
- Or use FTP — same destination.

### 404 troubleshooting checklist
1. Is the file actually at the path the URL implies?
2. Is `.htaccess` present in `public_html/`?
3. **Folder/file name collision?** (e.g., `foo.html` AND `foo/` both exist)
4. DevTools → Network tab → look at the full redirect chain (status codes 301 → 301 → 404 tells the story).
5. After fixing, hard-reload — the bad 301 may be cached in your browser.

### Don't break these invariants
- Canonical URLs are **always extensionless**, **always absolute**, **always `nichekala.in`** (not `www`, not `blackitechs.org`).
- The JSON-LD `Organization` block is the same on every page — never diverge it per-page.
- `<html lang="en-IN">` on every page.
- No folder named the same as any root `.html` page.
