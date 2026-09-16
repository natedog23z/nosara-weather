# Nosara Weather

Mobile-first static site for **daily weather briefings** for friends in **Nosara, Guanacaste, Costa Rica**.

This is an independent, human-curated briefing — **not** an official forecast. Always check [IMN](https://www.imn.ac.cr/) for official guidance.

## What’s here

| Path | Role |
|------|------|
| `index.html` | Homepage — loads `public/data/latest.json` + archive list |
| `day.html?id=YYYY-MM-DD` | Day view — loads that day’s archive JSON |
| `archive/YYYY-MM-DD.html` | Same day view via a static URL |
| `styles.css` | Pacific-coast layout (phone-first) |
| `app.js` | Fetch + render helpers |
| `public/data/latest.json` | Most recent briefing |
| `public/data/archive/*.json` | One JSON file per day |
| `public/data/index.json` | Lightweight list for the archive section |
| `scripts/upsert-briefing.mjs` | Add or replace a day’s briefing |

## Local preview

From the site root:

```bash
cd /workspace/nosara-weather-site
python3 -m http.server 8080
```

Open http://127.0.0.1:8080/

(Browsers block `fetch` of local JSON from `file://`, so use a small HTTP server.)

## How daily updates work

1. Write a briefing JSON for the day (same shape as `sample-briefing-2026-09-16.json`).
2. Run:

```bash
node scripts/upsert-briefing.mjs path/to/briefing.json
```

That script:

- Validates required fields (`id`, `takeaway`, `periods`, `gyreWatch`, …)
- Writes `public/data/archive/<id>.json`
- Copies it to `public/data/latest.json`
- Updates `public/data/index.json` (newest first)
- Writes `archive/<id>.html`

3. Commit and push (or re-upload) so the public host picks up the new files. See **PUBLISH.md**.

No backend, no database — just static files.

## Sharing with friends

Send them the public URL once it’s hosted. The homepage always shows today’s (latest) takeaway, forecast table, gyre watch, practical notes, and sources. Older days live under **Archive**.

## Design notes

Calm Pacific Guanacaste palette (sand, lagoon teal, sunset coral), large phone typography, stacked forecast cards on small screens. Content comes only from the JSON — the site never invents weather.
