/* Nosara Weather — render helpers */

const IMN_URL = "https://www.imn.ac.cr/";

function esc(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function linkifySource(s) {
  const name = esc(s.name || s);
  if (s.url) {
    return `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${name}</a>`;
  }
  return name;
}

function renderHeader(briefing, { showBack = false } = {}) {
  const back = showBack
    ? `<a class="nav-back" href="index.html">← All briefings</a>`
    : "";
  return `
    <header class="site-header">
      ${back}
      <h1 class="brand"><a href="index.html">Nosara Weather</a></h1>
      <p class="brand-sub">${esc(briefing.location || "Nosara, Guanacaste, Costa Rica")}</p>
      <span class="meta-date">${esc(briefing.updatedLocal || briefing.id || "")}</span>
      <svg class="wave-mark" viewBox="0 0 320 28" aria-hidden="true" preserveAspectRatio="none">
        <path fill="currentColor" d="M0 18 Q20 6 40 18 T80 18 T120 18 T160 18 T200 18 T240 18 T280 18 T320 18 V28 H0 Z"/>
      </svg>
    </header>
  `;
}

function renderTakeaway(briefing) {
  return `
    <section class="card takeaway" aria-labelledby="takeaway-h">
      <h2 id="takeaway-h">Takeaway</h2>
      <p>${esc(briefing.takeaway)}</p>
    </section>
  `;
}

function renderForecast(briefing) {
  const periods = briefing.periods || [];
  if (!periods.length) return "";
  const rows = periods
    .map(
      (p) => `
      <tr>
        <td data-label="Period">${esc(p.label)}</td>
        <td data-label="Pattern">${esc(p.pattern)}</td>
        <td data-label="Implications">${esc(p.implications)}</td>
        <td data-label="Confidence">${esc(p.confidence)}</td>
      </tr>`
    )
    .join("");
  return `
    <section class="card" aria-labelledby="forecast-h">
      <h2 id="forecast-h">Forecast</h2>
      <table class="forecast-table">
        <thead>
          <tr>
            <th>Period</th>
            <th>Pattern</th>
            <th>Implications</th>
            <th>Confidence</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </section>
  `;
}

function renderGyre(briefing) {
  const g = briefing.gyreWatch;
  if (!g) return "";
  return `
    <section class="card" aria-labelledby="gyre-h">
      <h2 id="gyre-h">Gyre watch</h2>
      <span class="status-pill">${esc(g.status)}</span>
      <div class="gyre-grid">
        <div class="gyre-item">
          <strong>Possible timing</strong>
          <p>${esc(g.possibleTiming)}</p>
        </div>
        <div class="gyre-item">
          <strong>Supporting</strong>
          <p>${esc(g.supporting)}</p>
        </div>
        <div class="gyre-item">
          <strong>Conflicting</strong>
          <p>${esc(g.conflicting)}</p>
        </div>
      </div>
    </section>
  `;
}

function renderWhatChanged(briefing) {
  if (!briefing.whatChanged) return "";
  return `
    <section class="card" aria-labelledby="changed-h">
      <h2 id="changed-h">What changed</h2>
      <p>${esc(briefing.whatChanged)}</p>
    </section>
  `;
}

function renderPractical(briefing) {
  if (!briefing.practical) return "";
  return `
    <section class="card" aria-labelledby="practical-h">
      <h2 id="practical-h">Practical</h2>
      <p>${esc(briefing.practical)}</p>
    </section>
  `;
}

function renderSources(briefing) {
  const sources = briefing.sources || [];
  const items = sources.map((s) => `<li>${linkifySource(s)}</li>`).join("");
  const models = briefing.modelsInspected
    ? `<p class="models-note">Models inspected: ${esc(briefing.modelsInspected)}</p>`
    : "";
  return `
    <section class="card" aria-labelledby="sources-h">
      <h2 id="sources-h">Sources</h2>
      <ul class="sources">${items}</ul>
      ${models}
    </section>
  `;
}

function renderFooter() {
  return `
    <footer class="site-footer">
      <p>Independent local briefing for friends in Nosara — <strong>not</strong> an official forecast.</p>
      <p>For official guidance, see <a href="${IMN_URL}" target="_blank" rel="noopener noreferrer">IMN (Instituto Meteorológico Nacional)</a>.</p>
    </footer>
  `;
}

function renderBriefing(briefing, opts = {}) {
  return [
    renderHeader(briefing, opts),
    renderTakeaway(briefing),
    renderForecast(briefing),
    renderGyre(briefing),
    renderWhatChanged(briefing),
    renderPractical(briefing),
    renderSources(briefing),
    renderFooter(),
  ].join("\n");
}

function renderArchiveList(indexData) {
  const list = (indexData && indexData.briefings) || [];
  if (!list.length) {
    return `<p class="state-msg">No archived briefings yet.</p>`;
  }
  const items = list
    .map((b) => {
      const href = `day.html?id=${encodeURIComponent(b.id)}`;
      return `
        <li>
          <a href="${href}">
            <div class="arch-date">${esc(b.id)}</div>
            <div class="arch-meta">${esc(b.updatedLocal || "")}</div>
            <div class="arch-take">${esc(b.takeaway || "")}</div>
          </a>
        </li>`;
    })
    .join("");
  return `
    <section class="card" aria-labelledby="archive-h">
      <h2 id="archive-h">Archive</h2>
      <ul class="archive-list">${items}</ul>
    </section>
  `;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
  return res.json();
}

async function loadLatest() {
  return fetchJson("public/data/latest.json");
}

async function loadArchive(id) {
  return fetchJson(`public/data/archive/${encodeURIComponent(id)}.json`);
}

async function loadIndex() {
  return fetchJson("public/data/index.json");
}

function getQueryId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

/** Infer briefing id from path like /archive/2026-09-16.html */
function getIdFromPath() {
  const m = window.location.pathname.match(/\/archive\/(\d{4}-\d{2}-\d{2})\.html$/);
  return m ? m[1] : null;
}

async function mountHome(root) {
  root.innerHTML = `<p class="state-msg">Loading briefing…</p>`;
  try {
    const [latest, indexData] = await Promise.all([loadLatest(), loadIndex()]);
    root.innerHTML =
      renderBriefing(latest, { showBack: false }) + renderArchiveList(indexData);
  } catch (err) {
    root.innerHTML = `<p class="state-msg error">Could not load briefing. ${esc(err.message)}</p>`;
  }
}

async function mountDay(root, id) {
  root.innerHTML = `<p class="state-msg">Loading day…</p>`;
  if (!id) {
    root.innerHTML = `<p class="state-msg error">Missing day id. Use day.html?id=YYYY-MM-DD</p>`;
    return;
  }
  try {
    const briefing = await loadArchive(id);
    root.innerHTML = renderBriefing(briefing, { showBack: true });
  } catch (err) {
    root.innerHTML = `<p class="state-msg error">Could not load ${esc(id)}. ${esc(err.message)}</p>`;
  }
}

window.NosaraWeather = {
  esc,
  renderBriefing,
  renderArchiveList,
  loadLatest,
  loadArchive,
  loadIndex,
  getQueryId,
  getIdFromPath,
  mountHome,
  mountDay,
};
