# Publishing Nosara Weather

The site is fully static: HTML, CSS, JS, and JSON. Any static host works.

## Option A — GitHub Pages

1. Create a GitHub repo and push this folder (or the whole repo with this site at the root / in `docs/`).
2. **Settings → Pages → Source**: Deploy from branch `main` (or `gh-pages`), folder `/` (or `/docs`).
3. Site URL will look like `https://<user>.github.io/<repo>/`.

If the site lives in a subfolder of the repo, either:

- Set Pages to that folder, or
- Use a root-level `index.html` that redirects, or move files to the publish root.

## Option B — Vercel

1. Install CLI: `npm i -g vercel` (or use the Vercel dashboard).
2. From the site root:

```bash
cd /workspace/nosara-weather-site
vercel
```

3. Accept defaults (static project, no build command needed). Output directory = `.` (project root).
4. Each `git push` (if linked) or `vercel --prod` republishes.

No serverless functions required.

## Option C — Netlify / Cloudflare Pages / similar

- Drag-and-drop the folder, or connect the Git repo.
- Build command: leave empty.
- Publish directory: the site root (where `index.html` lives).

## Option D — here.now (or any “drop a folder” host)

1. Zip or sync `/workspace/nosara-weather-site` (exclude nothing essential; `node_modules` is not required).
2. Upload / paste the folder into the host’s static publish flow.
3. Point the public URL at the folder that contains `index.html`.

## After publish checklist

- [ ] Homepage loads and shows the latest takeaway
- [ ] Archive links open a day page (`day.html?id=…` or `/archive/YYYY-MM-DD.html`)
- [ ] JSON URLs work: `/public/data/latest.json`, `/public/data/index.json`
- [ ] HTTPS works on the host you chose

## Updating after go-live

```bash
node scripts/upsert-briefing.mjs ./my-briefing.json
# then git push  — or  vercel --prod  — or re-upload the changed files under public/data/
```

Only `public/data/*` and optionally `archive/*.html` change day to day; HTML/CSS/JS stay put unless you restyle.
