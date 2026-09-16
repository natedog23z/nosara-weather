#!/usr/bin/env node
/**
 * Upsert a daily briefing into the static site data tree.
 *
 * Usage:
 *   node scripts/upsert-briefing.mjs path/to/briefing.json
 *
 * Writes:
 *   public/data/archive/<id>.json
 *   public/data/latest.json
 *   public/data/index.json  (sorted newest-first)
 *   archive/<id>.html       (static day shell)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const REQUIRED_TOP = [
  "id",
  "location",
  "timezone",
  "updatedLocal",
  "takeaway",
  "periods",
  "gyreWatch",
  "whatChanged",
  "practical",
  "sources",
];

const REQUIRED_PERIOD = ["label", "pattern", "implications", "confidence"];
const REQUIRED_GYRE = ["status", "possibleTiming", "supporting", "conflicting"];

function fail(msg) {
  console.error(`Error: ${msg}`);
  process.exit(1);
}

function validate(b) {
  for (const key of REQUIRED_TOP) {
    if (b[key] === undefined || b[key] === null || b[key] === "") {
      fail(`missing required field: ${key}`);
    }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.id)) {
    fail(`id must be YYYY-MM-DD, got "${b.id}"`);
  }
  if (!Array.isArray(b.periods) || b.periods.length === 0) {
    fail("periods must be a non-empty array");
  }
  b.periods.forEach((p, i) => {
    for (const k of REQUIRED_PERIOD) {
      if (!p[k]) fail(`periods[${i}].${k} is required`);
    }
  });
  for (const k of REQUIRED_GYRE) {
    if (!b.gyreWatch[k]) fail(`gyreWatch.${k} is required`);
  }
  if (!Array.isArray(b.sources) || b.sources.length === 0) {
    fail("sources must be a non-empty array");
  }
  b.sources.forEach((s, i) => {
    if (!s.name) fail(`sources[${i}].name is required`);
  });
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function writeArchiveHtml(id) {
  const dir = join(ROOT, "archive");
  mkdirSync(dir, { recursive: true });
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Nosara Weather — ${id}</title>
  <meta name="description" content="Weather briefing for Nosara, ${id}." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../styles.css" />
</head>
<body>
  <main id="app" class="wrap" aria-live="polite">
    <p class="state-msg">Loading day…</p>
  </main>
  <script src="../app.js"></script>
  <script>
    const origFetch = window.fetch.bind(window);
    window.fetch = (url, opts) => {
      if (typeof url === "string" && url.startsWith("public/")) {
        url = "../" + url;
      }
      return origFetch(url, opts);
    };
    const origMount = NosaraWeather.mountDay;
    NosaraWeather.mountDay = async function (root, id) {
      await origMount(root, id);
      root.querySelectorAll('a[href="index.html"]').forEach((a) => {
        a.setAttribute("href", "../index.html");
      });
    };
    NosaraWeather.mountDay(document.getElementById("app"), ${JSON.stringify(id)});
  </script>
</body>
</html>
`;
  writeFileSync(join(dir, `${id}.html`), html, "utf8");
}

function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    fail("usage: node scripts/upsert-briefing.mjs path/to/briefing.json");
  }
  const abs = resolve(inputPath);
  if (!existsSync(abs)) fail(`file not found: ${abs}`);

  let briefing;
  try {
    briefing = readJson(abs);
  } catch (e) {
    fail(`invalid JSON: ${e.message}`);
  }

  validate(briefing);

  const archivePath = join(ROOT, "public/data/archive", `${briefing.id}.json`);
  const latestPath = join(ROOT, "public/data/latest.json");
  const indexPath = join(ROOT, "public/data/index.json");

  writeJson(archivePath, briefing);
  writeJson(latestPath, briefing);

  let index = { briefings: [] };
  if (existsSync(indexPath)) {
    try {
      index = readJson(indexPath);
      if (!Array.isArray(index.briefings)) index.briefings = [];
    } catch {
      index = { briefings: [] };
    }
  }

  const entry = {
    id: briefing.id,
    updatedLocal: briefing.updatedLocal,
    takeaway: briefing.takeaway,
  };
  index.briefings = index.briefings.filter((b) => b.id !== briefing.id);
  index.briefings.push(entry);
  index.briefings.sort((a, b) => (a.id < b.id ? 1 : a.id > b.id ? -1 : 0));

  writeJson(indexPath, index);
  writeArchiveHtml(briefing.id);

  console.log(`Upserted briefing ${briefing.id}`);
  console.log(`  archive → ${archivePath}`);
  console.log(`  latest  → ${latestPath}`);
  console.log(`  index   → ${indexPath} (${index.briefings.length} entries)`);
  console.log(`  page    → ${join(ROOT, "archive", briefing.id + ".html")}`);
}

main();
