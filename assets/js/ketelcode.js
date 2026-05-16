/* ═══════════════════════════════════════
   DATA
═══════════════════════════════════════ */
let DATA = null;

/* ═══════════════════════════════════════
   STATE
═══════════════════════════════════════ */
let state = {
  currentPage: 'home',
  currentMerk: null,
  currentModel: null,
  currentStoring: null,
  modelFilterErnst: 'alle',
  merkTableRows: []
};

/* ═══════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════ */
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  document.getElementById('page-' + pageId).classList.add('active');
  const navEl = document.getElementById('nav-' + pageId);
  if (navEl) navEl.classList.add('active');
  state.currentPage = pageId;
  window.scrollTo(0, 0);
}

function openMerk(merkKey) {
  state.currentMerk = merkKey;
  const merk = DATA.merken[merkKey];
  document.getElementById('merk-breadcrumb').innerHTML = `
    <span onclick="showPage('home')">Home</span>
    <span class="sep">›</span>
    <span onclick="showPage('merken')">Merken</span>
    <span class="sep">›</span>
    <span class="current">${merk.naam}</span>
  `;
  document.getElementById('merk-title').textContent = merk.naam + ' storingscodes';
  document.getElementById('merk-desc').textContent = merk.beschrijving;
  document.getElementById('merk-name-inline').textContent = merk.naam;

  const mg = document.getElementById('models-grid');
  mg.innerHTML = '';
  Object.entries(merk.modellen).forEach(([modelKey, model]) => {
    const div = document.createElement('div');
    div.className = 'model-card';
    div.innerHTML = `<div class="model-name">${model.naam}</div><div class="model-info">${model.storingen.length} storingscodes · ${model.info}</div>`;
    div.onclick = () => openModel(merkKey, modelKey);
    mg.appendChild(div);
  });

  const rows = [];
  Object.entries(merk.modellen).forEach(([modelKey, model]) => {
    model.storingen.forEach(code => {
      const s = merk.storingen[code];
      if (s) rows.push({ modelKey, modelNaam: model.naam, code, s });
    });
  });
  state.merkTableRows = rows;
  renderMerkTable(rows);

  showPage('merk');
}

function renderMerkTable(rows) {
  const tbody = document.getElementById('merk-table-body');
  tbody.innerHTML = '';
  rows.forEach(({ modelKey, modelNaam, code, s }) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="code-badge">${s.code}</span></td>
      <td style="color:var(--c-text2);font-size:13px">${modelNaam}</td>
      <td style="color:var(--c-text)">${s.beschrijving}</td>
      <td><span class="ernst-badge ernst-${s.ernst}">${s.ernst}</span></td>
    `;
    tr.onclick = () => openStoring(state.currentMerk, modelKey, code);
    tbody.appendChild(tr);
  });
}

function filterMerkTable(q) {
  const lower = q.toLowerCase();
  const filtered = state.merkTableRows.filter(r =>
    r.code.toLowerCase().includes(lower) ||
    r.s.code.toLowerCase().includes(lower) ||
    r.s.beschrijving.toLowerCase().includes(lower) ||
    r.modelNaam.toLowerCase().includes(lower)
  );
  renderMerkTable(filtered);
}

function openModel(merkKey, modelKey) {
  state.currentMerk = merkKey;
  state.currentModel = modelKey;
  const merk = DATA.merken[merkKey];
  const model = merk.modellen[modelKey];

  document.getElementById('model-breadcrumb').innerHTML = `
    <span onclick="showPage('home')">Home</span>
    <span class="sep">›</span>
    <span onclick="showPage('merken')">Merken</span>
    <span class="sep">›</span>
    <span onclick="openMerk('${merkKey}')">${merk.naam}</span>
    <span class="sep">›</span>
    <span class="current">${model.naam}</span>
  `;
  document.getElementById('model-title').textContent = model.naam;
  document.getElementById('model-desc').textContent = model.info;

  state.modelFilterErnst = 'alle';
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.filter-btn').classList.add('active');

  renderModelTable();
  showPage('model');
}

function renderModelTable() {
  const merk = DATA.merken[state.currentMerk];
  const model = merk.modellen[state.currentModel];
  const tbody = document.getElementById('model-table-body');
  tbody.innerHTML = '';
  model.storingen.forEach(code => {
    const s = merk.storingen[code];
    if (!s) return;
    if (state.modelFilterErnst !== 'alle' && s.ernst !== state.modelFilterErnst) return;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="code-badge">${s.code}</span></td>
      <td style="color:var(--c-text)">${s.beschrijving}</td>
      <td><span class="ernst-badge ernst-${s.ernst}">${s.ernst}</span></td>
      <td style="color:var(--c-text3);font-size:12px">Bekijken →</td>
    `;
    tr.onclick = () => openStoring(state.currentMerk, state.currentModel, code);
    tbody.appendChild(tr);
  });
}

function filterModel(ernst, btn) {
  state.modelFilterErnst = ernst;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderModelTable();
}

function openStoring(merkKey, modelKey, code) {
  state.currentMerk = merkKey;
  state.currentModel = modelKey;
  state.currentStoring = code;

  const merk = DATA.merken[merkKey];
  const model = merk.modellen[modelKey];
  const s = merk.storingen[code];
  if (!s) return;

  document.getElementById('storing-breadcrumb').innerHTML = `
    <span onclick="showPage('home')">Home</span>
    <span class="sep">›</span>
    <span onclick="openMerk('${merkKey}')">${merk.naam}</span>
    <span class="sep">›</span>
    <span onclick="openModel('${merkKey}','${modelKey}')">${model.naam}</span>
    <span class="sep">›</span>
    <span class="current">Storing ${s.code}</span>
  `;
  document.getElementById('storing-code-display').textContent = s.code;
  document.getElementById('storing-h1').textContent = s.beschrijving;
  document.getElementById('storing-meta-row').innerHTML = `
    <span class="meta-chip">${merk.naam}</span>
    <span class="meta-chip">${model.naam}</span>
    <span class="ernst-badge ernst-${s.ernst}" style="margin-left:4px">${s.ernst} risico</span>
  `;

  const body = document.getElementById('storing-body');
  body.innerHTML = '';

  const grid1 = document.createElement('div');
  grid1.className = 'info-grid';
  grid1.innerHTML = `
    <div class="info-block">
      <div class="info-block-title"><span class="dot dot-amber"></span>Mogelijke oorzaken</div>
      <ul>${s.oorzaken.map(o=>`<li>${o}</li>`).join('')}</ul>
    </div>
    <div class="info-block">
      <div class="info-block-title"><span class="dot dot-blue"></span>Controlepunten</div>
      <ul>${s.controlepunten.map(c=>`<li>${c}</li>`).join('')}</ul>
    </div>
  `;
  body.appendChild(grid1);

  const stapBlk = document.createElement('div');
  stapBlk.className = 'info-block';
  stapBlk.style.marginTop = '1.25rem';
  stapBlk.innerHTML = `<div class="info-block-title"><span class="dot dot-green"></span>Stap-voor-stap oplossing</div>
    <div class="stappen">${s.stappen.map((st,i)=>`
      <div class="stap">
        <div class="stap-num">${i+1}</div>
        <div class="stap-body"><strong>${st.titel}</strong><p>${st.omschrijving}</p></div>
      </div>
    `).join('')}</div>`;
  body.appendChild(stapBlk);

  const grid2 = document.createElement('div');
  grid2.className = 'info-grid';
  grid2.style.marginTop = '1.25rem';
  grid2.innerHTML = `
    <div class="info-block">
      <div class="info-block-title"><span class="dot dot-accent"></span>Wanneer vervangen?</div>
      <p style="font-size:14px;color:var(--c-text2);line-height:1.6">${s.vervanging}</p>
    </div>
    <div class="info-block">
      <div class="info-block-title"><span class="dot dot-blue"></span>Erkend installateur nodig?</div>
      <p style="font-size:14px;color:var(--c-text2);line-height:1.6">${s.installateur}</p>
    </div>
  `;
  body.appendChild(grid2);

  if (s.veiligheid) {
    const veil = document.createElement('div');
    veil.style.marginTop = '1.25rem';
    veil.innerHTML = `<div class="alert alert-danger"><span class="alert-icon">⚠</span><div><strong>Veiligheid:</strong> ${s.veiligheid}</div></div>`;
    body.appendChild(veil);
  }

  const nav = document.createElement('div');
  nav.style.cssText = 'display:flex;justify-content:space-between;margin-top:2.5rem;padding-top:1.5rem;border-top:1px solid var(--c-border)';
  nav.innerHTML = `
    <button class="back-btn" onclick="openModel('${merkKey}','${modelKey}')">Alle storingen ${model.naam}</button>
    <button class="back-btn" style="flex-direction:row-reverse" onclick="openMerk('${merkKey}')">Alle storingen ${merk.naam} →</button>
  `;
  body.appendChild(nav);

  showPage('storing');
}

/* ═══════════════════════════════════════
   SEARCH
═══════════════════════════════════════ */
function buildSearchIndex() {
  const idx = [];
  Object.entries(DATA.merken).forEach(([merkKey, merk]) => {
    Object.entries(merk.modellen).forEach(([modelKey, model]) => {
      model.storingen.forEach(code => {
        const s = merk.storingen[code];
        if (!s) return;
        idx.push({
          merkKey, modelKey,
          code: s.code,
          beschrijving: s.beschrijving,
          label: `${merk.naam} ${model.naam}`,
          ernst: s.ernst
        });
      });
    });
  });
  return idx;
}
let SEARCH_INDEX = [];

async function loadData() {
  const response = await fetch('assets/data/data.json');
  DATA = await response.json();
  SEARCH_INDEX = buildSearchIndex();
  renderBrandGrid('home-brand-grid');
  renderBrandGrid('merken-brand-grid');
  renderPopularGrid();
  renderKennisbankPreview('home-kb-preview', 3);
  renderKennisbankPreview('kennisbank-grid');
}

function handleSearch(q) {
  const results = document.getElementById('search-results');
  if (!q || q.length < 1) { results.classList.remove('open'); return; }
  const lower = q.toLowerCase();
  const hits = SEARCH_INDEX.filter(item =>
    item.code.toLowerCase().includes(lower) ||
    item.beschrijving.toLowerCase().includes(lower) ||
    item.label.toLowerCase().includes(lower)
  ).slice(0, 8);

  if (!hits.length) {
    results.innerHTML = '<div class="search-result-item" style="color:var(--c-text3);cursor:default">Geen resultaten gevonden</div>';
    results.classList.add('open');
    return;
  }

  results.innerHTML = hits.map(h => `
    <div class="search-result-item" onclick="openStoring('${h.merkKey}','${h.modelKey}','${h.code.toLowerCase()}'); document.getElementById('hero-search').value=''; document.getElementById('search-results').classList.remove('open');">
      <span class="sr-code">${h.code}</span>
      <span class="sr-label">${h.beschrijving}</span>
      <span class="sr-meta">${h.label}</span>
    </div>
  `).join('');
  results.classList.add('open');
}

document.addEventListener('click', e => {
  if (!e.target.closest('.search-bar-wrap')) {
    document.getElementById('search-results').classList.remove('open');
  }
});

function renderBrandGrid(containerId) {
  const colors = { intergas:'#e05c1e', remeha:'#005aab', nefit:'#e30613', vaillant:'#009944', bosch:'#e20015' };
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  Object.entries(DATA.merken).forEach(([key, merk]) => {
    const totalStoringen = Object.keys(merk.storingen).length;
    const totalModellen = Object.keys(merk.modellen).length;
    const div = document.createElement('div');
    div.className = 'brand-card';
    div.innerHTML = `
      <div class="brand-icon" style="background:${colors[key]}22;color:${colors[key]}">${merk.naam.substring(0,2).toUpperCase()}</div>
      <div class="brand-name">${merk.naam}</div>
      <div class="brand-count">${totalModellen} modellen · ${totalStoringen} codes</div>
    `;
    div.onclick = () => openMerk(key);
    container.appendChild(div);
  });
}

function renderPopularGrid() {
  const container = document.getElementById('popular-grid');
  if (!container) return;
  container.innerHTML = '';
  DATA.populair.forEach(({ merkKey, modelKey, code }) => {
    const merk = DATA.merken[merkKey];
    const model = merk.modellen[modelKey];
    const s = merk.storingen[code];
    if (!s) return;
    const div = document.createElement('div');
    div.className = 'popular-card';
    div.innerHTML = `
      <div class="pop-code">${s.code}</div>
      <div class="pop-info">
        <div class="pop-merk">${merk.naam} · ${model.naam}</div>
        <div class="pop-desc">${s.beschrijving}</div>
      </div>
      <span class="ernst-badge ernst-${s.ernst}">${s.ernst}</span>
    `;
    div.onclick = () => openStoring(merkKey, modelKey, code);
    container.appendChild(div);
  });
}

function renderKennisbankPreview(containerId, limit) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  const items = limit ? DATA.kennisbank.slice(0, limit) : DATA.kennisbank;
  items.forEach(kb => {
    const div = document.createElement('div');
    div.className = 'kb-card';
    div.innerHTML = `<div class="kb-tag">${kb.tag}</div><h3>${kb.titel}</h3><p>${kb.tekst}</p>`;
    div.onclick = () => showPage('kennisbank');
    container.appendChild(div);
  });
}

loadData();
