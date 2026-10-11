/* Bharat Setu — application shell. Vanilla JS, no build step, offline-first. */
(() => {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const LS = {
  get(k, d) { try { const v = localStorage.getItem('bs_' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('bs_' + k, JSON.stringify(v)); } catch {} },
};

const STATE = {
  lang: LS.get('lang', 'hi'),
  theme: LS.get('theme', 'light'),
  contrast: LS.get('contrast', 'normal'),
  font: LS.get('font', 100),
  voice: LS.get('voice', true),
  simple: LS.get('simple', false),
  online: 'unknown',
  profile: LS.get('profile', {}),
  results: [],
  checkedDocs: LS.get('docs', []),
  letter: '',
  lastAiSource: null,
  chat: LS.get('chat', []),
  // Application tracker: schemeId -> { status:'todo'|'applied'|'received'|'rejected', note, ts }
  plan: LS.get('plan', {}),
  // Named family members (multi-profile) → each is a saved profile object
  members: LS.get('members', []),
  activeMember: LS.get('activeMember', 0),
};

const STATES_LIST = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman & Nicobar Islands","Chandigarh","Dadra & Nagar Haveli and Daman & Diu","Delhi","Jammu & Kashmir","Ladakh","Lakshadweep","Puducherry"];

const FLAG_KEYS = ['bpl','student','girl_child','senior','disability','widow','pregnant','tb','housing','employed','business','family'];

/* ————————————— i18n rendering ————————————— */
function T(k) { return t(k, STATE.lang); }

function applyLang() {
  const html = document.documentElement;
  html.lang = STATE.lang;
  html.dir = isRTL(STATE.lang) ? 'rtl' : 'ltr';
  $$('[data-i18n]').forEach(el => { const v = T(el.dataset.i18n); if (typeof v === 'string') el.textContent = v; });
  $$('[data-i18n-ph]').forEach(el => { el.placeholder = T(el.dataset.i18nPh); });
  // Rebuild dynamic selects/labels
  buildFlagBoxes();
  buildOccupation();
  buildDocList();
  renderResults();
  renderDocResult();
  renderHelp();
  renderPlan();
  if (STATE.letter) $('#letterOut').textContent = STATE.letter;
  renderChat();
  $('#langSel').value = STATE.lang;
}

function setLang(l) { STATE.lang = l; LS.set('lang', l); applyLang(); toast(T('saved')); }

/* ————————————— Theme / accessibility ————————————— */
function applyA11y() {
  const h = document.documentElement;
  h.dataset.theme = STATE.theme;
  h.dataset.contrast = STATE.contrast;
  h.dataset.simple = STATE.simple ? 'on' : 'off';
  h.style.setProperty('--fs', (STATE.font / 100 * 16) + 'px');
  $('#btnTheme').textContent = STATE.theme === 'dark' ? '☀️' : '🌙';
  $('#btnVoice').textContent = STATE.voice ? '🔊' : '🔇';
  $('#btnVoice').title = STATE.voice ? T('voiceOn') : T('voiceOff');
  const bs = $('#btnSimple');
  if (bs) { bs.classList.toggle('on', STATE.simple); bs.title = STATE.simple ? T('simpleOn') : T('simpleOff'); }
}
function toggleTheme() { STATE.theme = STATE.theme === 'dark' ? 'light' : 'dark'; LS.set('theme', STATE.theme); applyA11y(); }
function toggleContrast() { STATE.contrast = STATE.contrast === 'high' ? 'normal' : 'high'; LS.set('contrast', STATE.contrast); applyA11y(); }
function bumpFont(d) { STATE.font = Math.min(140, Math.max(85, STATE.font + d)); LS.set('font', STATE.font); applyA11y(); }
function toggleVoice() { STATE.voice = !STATE.voice; LS.set('voice', STATE.voice); applyA11y(); if (!STATE.voice) speechSynthesis.cancel(); }
function toggleSimple() {
  STATE.simple = !STATE.simple; LS.set('simple', STATE.simple);
  if (STATE.simple) { STATE.font = Math.max(STATE.font, 118); LS.set('font', STATE.font); }
  applyA11y(); toast(STATE.simple ? T('simpleOn') : T('simpleOff'));
}

let toastTimer;
function toast(msg) {
  const el = $('#toast'); el.textContent = msg; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

/* ————————————— Speech ————————————— */
function speak(text) {
  if (!STATE.voice || !('speechSynthesis' in window)) return;
  try {
    const clean = String(text).replace(/[#*`>_\-]/g, ' ').replace(/https?:\/\/\S+/g, ' ').replace(/\s+/g, ' ').slice(0, 900);
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = voiceLocale(STATE.lang); u.rate = 0.98;
    const match = speechSynthesis.getVoices().find(v => v.lang === u.lang) ||
                  speechSynthesis.getVoices().find(v => v.lang?.startsWith(STATE.lang));
    if (match) u.voice = match;
    speechSynthesis.speak(u);
  } catch {}
}
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => {};

let recog = null, listening = false;
function initRecog() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const r = new SR();
  r.continuous = false; r.interimResults = false; r.maxAlternatives = 1;
  return r;
}
function startListen(targetId) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { toast('Voice input needs Chrome or Edge browser.'); return; }
  if (listening) { recog && recog.stop(); return; }
  recog = recog || initRecog();
  recog.lang = voiceLocale(STATE.lang);
  let heard = '';
  recog.onstart = () => { listening = true; $('#btnMic')?.classList.add('rec'); toast(T('listening')); };
  recog.onerror = () => { listening = false; $('#btnMic')?.classList.remove('rec'); };
  recog.onend = () => {
    listening = false; $('#btnMic')?.classList.remove('rec');
    if (heard) { const el = $('#' + targetId); if (el) { el.value = heard; el.focus(); } }
  };
  recog.onresult = (e) => {
    heard = [...e.results].map(r => r[0].transcript).join(' ');
    if (targetId === 'chatInput' && heard) { $('#chatInput').value = heard; sendChat(); }
  };
  try { recog.start(); } catch { recog.stop(); }
}

/* ————————————— Navigation ————————————— */
function go(view) {
  $$('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + view));
  $$('.tab').forEach(t => t.setAttribute('aria-current', t.dataset.view === view ? 'page' : 'false'));
  location.hash = '#' + view;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function initNav() {
  $$('.tab').forEach(t => t.addEventListener('click', e => { e.preventDefault(); go(t.dataset.view); }));
  $$('[data-goto]').forEach(b => b.addEventListener('click', () => go(b.dataset.goto)));
  const h = location.hash.replace('#', '');
  if (h && $('#view-' + h)) go(h);
}

/* ————————————— Scheme Finder ————————————— */
function buildFlagBoxes() {
  const wrap = $('#flagBoxes'); if (!wrap) return;
  const cur = STATE.profile.flags || {};
  const labels = T('flags') || {};
  wrap.innerHTML = '';
  for (const k of FLAG_KEYS) {
    const lab = labels[k] || k;
    if (!lab) continue;
    const d = document.createElement('label');
    d.className = 'chk';
    d.innerHTML = `<input type="checkbox" data-flag="${k}" ${cur[k] ? 'checked' : ''}><span>${lab}</span>`;
    wrap.appendChild(d);
  }
  wrap.querySelectorAll('input').forEach(i => i.addEventListener('change', () => collectProfile()));
}

function buildOccupation() {
  const sel = $('#occupation'); if (!sel) return;
  const map = [['', 'occChoose'], ['farmer', 'occFarmer'], ['worker', 'occWorker'], ['student', 'occStudent'], ['job', 'occJob'], ['business', 'occBusiness'], ['none', 'occNone']];
  sel.innerHTML = map.map(([v, k]) => `<option value="${v}">${T(k)}</option>`).join('');
  sel.value = STATE.profile.occupation || '';
}

function collectProfile() {
  const p = {
    age: $('#age').value ? Number($('#age').value) : null,
    childAge: $('#childAge') && $('#childAge').value ? Number($('#childAge').value) : null,
    gender: $('#gender').value || null,
    area: $('#area').value || null,
    state: $('#stateSel').value || null,
    income: $('#income').value ? Number($('#income').value) : null,
    category: $('#category').value || null,
    landAcres: $('#land').value !== '' && $('#land') ? Number($('#land').value) : null,
    occupation: $('#occupation').value || null,
    flags: {},
  };
  $$('#flagBoxes input').forEach(i => { if (i.checked) p.flags[i.dataset.flag] = true; });
  p.interests = [];
  if (p.occupation === 'farmer') p.interests.push('farmer');
  if (p.flags.student) p.interests.push('education');
  if (p.flags.bpl) p.interests.push('bpl');
  if (p.flags.housing) p.interests.push('housing');
  STATE.profile = p;
  LS.set('profile', p);
  return p;
}

function fillProfile(p) {
  STATE.profile = p; LS.set('profile', p);
  $('#age').value = p.age ?? '';
  if ($('#childAge')) $('#childAge').value = p.childAge ?? '';
  $('#gender').value = p.gender || '';
  $('#area').value = p.area || '';
  $('#stateSel').value = p.state || '';
  $('#income').value = p.income ?? '';
  $('#category').value = p.category || '';
  if ($('#land')) $('#land').value = p.landAcres ?? '';
  $('#occupation').value = p.occupation || '';
  buildFlagBoxes();
}

const DEMO = {
  age: 34, gender: 'female', area: 'rural', state: 'Uttar Pradesh', income: 180000,
  category: 'obc', landAcres: 1.5, occupation: 'farmer',
  flags: { bpl: true, student: true, girl_child: true, senior: true, housing: true, family: true },
  interests: ['farmer', 'education', 'bpl', 'housing'],
};

function runFind() {
  const p = collectProfile();
  const res = rankSchemes(p);
  STATE.results = res;
  STATE.resultsRendered = true;
  renderResults();
  renderPlan();
  const strong = res.filter(r => r.verdict === 'high').length;
  if (!res.length) { toast(T('noResults')); speak(T('noResults')); return; }
  $('#resultCount').textContent = `${res.length} ${T('matches')}`;
  $('#strongCount').textContent = strong;
  const box = $('#results');
  box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  speak(`${res.length} ${T('matches')}. ${strong} ${T('strong')}.`);
}

function schemeCard(r) {
  const s = r.scheme;
  const v = r.verdict;
  const vlabel = v === 'high' ? T('strong') : v === 'mid' ? T('possible') : T('notEligible');
  const name = STATE.lang === 'hi' && s.name_hi ? s.name_hi : s.name;
  const benefit = STATE.lang === 'hi' && s.benefit_hi ? s.benefit_hi : s.benefit;
  const shown = (r.reasons || []).slice(0, 4).map(x => `<span class="tag why">✓ ${esc(x)}</span>`).join('');
  const blocked = (r.blockers || []).slice(0, 3).map(x => `<span class="tag block">✕ ${esc(x)}</span>`).join('');
  return `<article class="scheme ${v}" data-scheme="${s.id}">
    <div class="row spread">
      <h3>${esc(name)}</h3>
      <span class="tag ${v === 'high' ? 'why' : ''}">${esc(vlabel)}</span>
    </div>
    <p class="benefit">${esc(benefit)}</p>
    <p class="small muted" style="margin:0">${esc(s.desc)}</p>
    <div class="tagrow">${s.cats.slice(0, 4).map(c => `<span class="tag">${esc(CATEGORY_LABELS[c] || c)}</span>`).join('')}</div>
    <details><summary>${esc(T('whyEligible'))}</summary><div class="tagrow" style="margin-top:8px">${shown || '<span class="tag">Add more details for a precise reason list</span>'}${blocked}</div></details>
    <details><summary>${esc(T('documents'))}</summary><ul class="small list" style="margin:8px 0 0;padding-left:18px">${(s.docs || []).map(d => `<li>${esc(d)}</li>`).join('')}</ul></details>
    <details><summary>${esc(T('howApply'))}</summary><ol class="small" style="margin:8px 0 0;padding-left:18px">${(s.how || []).map(h => `<li>${esc(h)}</li>`).join('')}</ol></details>
    <div class="row" style="margin-top:auto">
      <a class="btn btn-solid btn-sm" href="${s.apply_url}" target="_blank" rel="noopener">🔗 ${esc(T('official'))}</a>
      <button class="btn btn-outline btn-sm" data-ask="${s.id}">💬 ${esc(T('askAbout'))}</button>
      <button class="btn btn-outline btn-sm" data-save="${s.id}">★ ${esc(T('copySummary'))}</button>
    </div>
  </article>`;
}

function renderResults() {
  const box = $('#results'); if (!box) return;
  if (!STATE.results.length) {
    box.innerHTML = STATE.resultsRendered ? `<p class="muted">${esc(T('noResults'))}</p>` : '';
    return;
  }
  box.innerHTML = STATE.results.map(schemeCard).join('');
  box.querySelectorAll('[data-ask]').forEach(b => b.addEventListener('click', () => {
    const s = SCHEMES.find(x => x.id === b.dataset.ask);
    go('assistant');
    $('#chatInput').value = STATE.lang === 'hi' && s.name_hi ? `${s.name_hi} के लिए जरूरी दस्तावेज़ और आवेदन प्रक्रिया बताइए` : `Explain documents and the application process for ${s.name}`;
    sendChat();
  }));
  box.querySelectorAll('[data-save]').forEach(b => b.addEventListener('click', () => copyPlan()));
}

function copyPlan() {
  const p = STATE.profile;
  const top = STATE.results.filter(r => r.verdict === 'high' || r.verdict === 'mid');
  const lines = ['BHARAT SETU — MY BENEFIT PLAN', '', 'My profile: ' + JSON.stringify(p), '', ''];
  for (const r of top) {
    lines.push(`• ${r.scheme.name} [${r.verdict}]`);
    lines.push(`  Benefit: ${r.scheme.benefit}`);
    lines.push(`  Documents: ${(r.scheme.docs || []).join(', ')}`);
    lines.push(`  Apply: ${r.scheme.apply_url}`);
    lines.push(`  Why: ${(r.reasons || []).join(' | ')}`);
    lines.push('');
  }
  lines.push('Generated by Bharat Setu · verify on the official portal · Helplines: 112 emergency, 181 women, 1930 cyber fraud');
  const txt = lines.join('\n');
  navigator.clipboard?.writeText(txt).then(() => toast(T('saved')), () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt], { type: 'text/plain' }));
    a.download = 'bharat-setu-plan.txt'; a.click();
  });
}

/* ————————————— Benefit estimator ————————————— */
/* Parse the headline ₹ figure out of a scheme's benefit text so we can estimate
   the annual value of the benefits a user is eligible for. Conservative: takes
   the FIRST ₹ amount that looks like an annual/one-time entitlement. */
function parseBenefitINR(text) {
  if (!text) return 0;
  const t = String(text).replace(/,/g, '');
  const m = t.match(/₹\s*(\d{3,7})/);
  if (!m) return 0;
  let v = parseInt(m[1], 10);
  if (/\/\s*(month|mahina|mah|माह|महीना)/i.test(text)) v *= 12;
  if (/lakh|lac|लाख/i.test(text)) v = Math.max(v, 0);
  return v;
}

function computeEstimate(results) {
  const top = (results || []).filter(r => r.verdict === 'high' || r.verdict === 'mid');
  let total = 0;
  const rows = [];
  for (const r of top) {
    const v = parseBenefitINR(r.scheme.benefit);
    if (v > 0) { total += v; rows.push({ name: r.scheme.name, v, id: r.scheme.id }); }
  }
  rows.sort((a, b) => b.v - a.v);
  return { total, rows, count: top.length };
}

function renderPlan() {
  const planBox = $('#planStats'); if (!planBox) return;
  const est = computeEstimate(STATE.results);
  const statuses = STATE.plan || {};
  const applied = Object.values(statuses).filter(s => s.status === 'applied').length;
  const received = Object.values(statuses).filter(s => s.status === 'received').length;
  const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');

  planBox.innerHTML = `
    <div class="stat"><b>${STATE.results.length}</b><span>${esc(T('matches'))}</span></div>
    <div class="stat"><b>${applied}</b><span>${esc(T('stApplied'))}</span></div>
    <div class="stat"><b>${received}</b><span>${esc(T('stReceived'))}</span></div>`;

  const pill = $('#estimatePill'); if (pill) pill.textContent = fmt(est.total);
  const body = $('#estimateBody');
  if (body) {
    if (!est.rows.length) {
      body.innerHTML = `<p class="small muted">${esc(T('estimateEmpty'))}</p>`;
    } else {
      body.innerHTML = `<table class="est-table"><tbody>${est.rows.slice(0, 8).map(r =>
        `<tr><td>${esc(r.name)}</td><td class="num">${fmt(r.v)}</td></tr>`).join('')}
        </tbody><tfoot><tr><th>${esc(T('estimateTotal'))}</th><th class="num">${fmt(est.total)}</th></tr></tfoot></table>`;
    }
  }

  const list = $('#trackerList'); if (!list) return;
  const top = STATE.results.filter(r => r.verdict === 'high' || r.verdict === 'mid');
  if (!top.length) {
    list.innerHTML = `<div class="card"><p class="muted">${esc(T('planEmpty'))}</p>
      <button class="btn btn-primary btn-sm" data-goto="finder">🧭 ${esc(T('navFinder'))}</button></div>`;
    list.querySelectorAll('[data-goto]').forEach(b => b.addEventListener('click', () => go(b.dataset.goto)));
    return;
  }
  const label = { todo: T('stTodo'), applied: T('stApplied'), received: T('stReceived'), rejected: T('stRejected') };
  list.innerHTML = top.map(r => {
    const st = statuses[r.scheme.id] || { status: 'todo', note: '' };
    const docs = docReadiness(STATE.checkedDocs, STATE.profile);
    const need = (r.scheme.docs || []);
    const have = need.filter(d => STATE.checkedDocs.includes(d));
    return `<article class="card tracker st-${st.status}" data-track="${r.scheme.id}">
      <div class="row spread"><h3 style="margin:0">${esc(r.scheme.name)}</h3><span class="tag">${esc(label[st.status])}</span></div>
      <p class="small muted">${esc(r.scheme.benefit)}</p>
      <div class="bar" style="margin:6px 0"><i style="width:${need.length ? Math.round(have.length / need.length * 100) : 0}%"></i></div>
      <p class="tiny muted">${have.length}/${need.length} ${esc(T('documents'))} ✓</p>
      <div class="field" style="margin-top:8px">
        <label class="sr">Status</label>
        <select data-st="${r.scheme.id}">
          <option value="todo" ${st.status === 'todo' ? 'selected' : ''}>${esc(label.todo)}</option>
          <option value="applied" ${st.status === 'applied' ? 'selected' : ''}>${esc(label.applied)}</option>
          <option value="received" ${st.status === 'received' ? 'selected' : ''}>${esc(label.received)}</option>
          <option value="rejected" ${st.status === 'rejected' ? 'selected' : ''}>${esc(label.rejected)}</option>
        </select>
      </div>
      <input type="text" data-note="${r.scheme.id}" placeholder="${esc(T('notePh'))}" value="${esc(st.note || '')}">
      <div class="row" style="margin-top:8px">
        <a class="btn btn-solid btn-sm" href="${r.scheme.apply_url}" target="_blank" rel="noopener">🔗 ${esc(T('official'))}</a>
      </div>
    </article>`;
  }).join('');
  list.querySelectorAll('[data-st]').forEach(sel => sel.addEventListener('change', () => {
    const id = sel.dataset.st;
    STATE.plan[id] = STATE.plan[id] || { status: 'todo', note: '' };
    STATE.plan[id].status = sel.value; LS.set('plan', STATE.plan); renderPlan();
    toast(T('saved'));
  }));
  list.querySelectorAll('[data-note]').forEach(inp => inp.addEventListener('change', () => {
    const id = inp.dataset.note;
    STATE.plan[id] = STATE.plan[id] || { status: 'todo', note: '' };
    STATE.plan[id].note = inp.value; LS.set('plan', STATE.plan);
  }));
}

function planText() {
  const est = computeEstimate(STATE.results);
  const lines = ['BHARAT SETU — MY BENEFIT PLAN', '================================', ''];
  if (STATE.profile && Object.keys(STATE.profile).length) {
    const p = STATE.profile;
    lines.push('My profile: ' + [p.age ? `age ${p.age}` : '', p.gender || '', p.area || '', p.state || '', p.income ? `income ₹${p.income}` : '', p.occupation || ''].filter(Boolean).join(', '));
    lines.push('');
  }
  const top = STATE.results.filter(r => r.verdict === 'high' || r.verdict === 'mid');
  lines.push(`Estimated annual benefit value: ₹${est.total.toLocaleString('en-IN')} across ${top.length} matched schemes`, '');
  for (const r of top) {
    const st = (STATE.plan[r.scheme.id] || {}).status || 'todo';
    lines.push(`• ${r.scheme.name}  [${r.verdict} · ${st}]`);
    lines.push(`  Benefit: ${r.scheme.benefit}`);
    lines.push(`  Documents: ${(r.scheme.docs || []).join(', ')}`);
    lines.push(`  Apply: ${r.scheme.apply_url}`);
    lines.push(`  Why: ${(r.reasons || []).join(' | ')}`);
    lines.push('');
  }
  lines.push('Generated by Bharat Setu · verify every detail on the official portal.');
  lines.push('Helplines — 112 emergency · 181 women · 1930 cyber fraud · 1098 child.');
  return lines.join('\n');
}

function exportPlan() {
  const txt = planText();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([txt], { type: 'text/plain' }));
  a.download = 'bharat-setu-plan.txt'; a.click();
  toast(T('saved'));
}
async function sharePlan() {
  const txt = planText();
  if (navigator.share) {
    try { await navigator.share({ title: 'Bharat Setu — My Benefit Plan', text: txt }); return; } catch {}
  }
  try { await navigator.clipboard.writeText(txt); toast(T('copied')); }
  catch { exportPlan(); }
}

/* ————————————— What-if simulator ————————————— */
/* Re-runs the eligibility engine against a tweaked age/income WITHOUT touching
   the saved profile — so a citizen can see "if my income were lower, what opens up?" */
function wiProfile() {
  const p = Object.assign({}, STATE.profile || {});
  const a = $('#wiAge'), i = $('#wiIncome');
  if (a) p.age = Number(a.value);
  if (i) p.income = Number(i.value);
  return p;
}
function renderWhatIf() {
  const out = $('#wiOut'); if (!out) return;
  const a = $('#wiAge'), i = $('#wiIncome');
  const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');
  if ($('#wiAgeOut')) $('#wiAgeOut').textContent = a ? a.value : '—';
  if ($('#wiIncomeOut')) $('#wiIncomeOut').textContent = i ? fmt(i.value) : '—';
  const res = rankSchemes(wiProfile());
  const est = computeEstimate(res);
  const strong = res.filter(r => r.verdict === 'high').length;
  const base = STATE.results || [];
  const gained = res.filter(r => !base.some(b => b.scheme.id === r.scheme.id)).map(r => r.scheme);
  const lost = base.filter(b => !res.some(r => r.scheme.id === b.scheme.id)).map(b => b.scheme);
  out.innerHTML = `
    <div class="grid g3" style="width:100%">
      <div class="stat"><b>${res.length}</b><span>${esc(T('matches'))}</span></div>
      <div class="stat"><b>${strong}</b><span>${esc(T('strong'))}</span></div>
      <div class="stat"><b>${fmt(est.total)}</b><span>${esc(T('estimateShort'))}</span></div>
    </div>
    <div style="width:100%">
      ${gained.length ? `<p class="small" style="color:var(--ok)"><b>+ ${esc(T('wiGain'))}:</b> ${gained.slice(0, 6).map(s => esc(s.name)).join(', ')}</p>` : ''}
      ${lost.length ? `<p class="small" style="color:var(--bad)"><b>− ${esc(T('wiLose'))}:</b> ${lost.slice(0, 6).map(s => esc(s.name)).join(', ')}</p>` : ''}
      ${!gained.length && !lost.length ? `<p class="small muted">${esc(T('wiSame'))}</p>` : ''}
    </div>`;
}
function openWhatIf() {
  const card = $('#whatIfCard'); if (!card) return;
  card.hidden = false;
  const p = STATE.profile || {};
  if ($('#wiAge')) $('#wiAge').value = p.age || 34;
  if ($('#wiIncome')) $('#wiIncome').value = Math.min(1200000, p.income || 180000);
  renderWhatIf();
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ————————————— Household (multi-member) ————————————— */
function memberLabel(m, i) {
  const p = m.profile || {};
  const who = p.occupation || p.gender || T('member');
  return `${m.name || T('member') + ' ' + (i + 1)} · ${who}`;
}
function renderHousehold() {
  const chips = $('#memberChips'); if (!chips) return;
  if (!STATE.members.length) {
    chips.innerHTML = `<p class="small muted">${esc(T('householdEmpty'))}</p>`;
    return;
  }
  chips.innerHTML = STATE.members.map((m, i) => `
    <button class="chip ${i === STATE.activeMember ? 'on' : ''}" data-m="${i}">
      ${esc(m.name || (T('member') + ' ' + (i + 1)))} <span class="tiny muted">${esc((m.profile || {}).occupation || '')}</span>
      <span class="chip-x" data-del="${i}" title="Remove">✕</span>
    </button>`).join('');
  chips.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', e => {
    if (e.target.dataset.del != null) return;
    loadMember(Number(b.dataset.m));
  }));
  chips.querySelectorAll('[data-del]').forEach(x => x.addEventListener('click', e => {
    e.stopPropagation();
    STATE.members.splice(Number(x.dataset.del), 1);
    if (STATE.activeMember >= STATE.members.length) STATE.activeMember = Math.max(0, STATE.members.length - 1);
    LS.set('members', STATE.members); renderHousehold();
  }));
}
function saveMember() {
  const p = collectProfile();
  const name = (prompt(T('memberNamePrompt'), '') || '').trim();
  STATE.members.push({ name: name || (T('member') + ' ' + (STATE.members.length + 1)), profile: p });
  STATE.activeMember = STATE.members.length - 1;
  LS.set('members', STATE.members); LS.set('activeMember', STATE.activeMember);
  renderHousehold(); toast(T('saved'));
}
function loadMember(i) {
  const m = STATE.members[i]; if (!m) return;
  STATE.activeMember = i; LS.set('activeMember', i);
  fillProfile(m.profile || {});
  renderHousehold();
  runFind();
  toast(T('memberLoaded'));
}
function householdAll() {
  const out = $('#householdOut'); if (!out) return;
  if (!STATE.members.length) { out.innerHTML = `<p class="small muted">${esc(T('householdEmpty'))}</p>`; return; }
  const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');
  let grand = 0;
  const rows = STATE.members.map((m, i) => {
    const res = rankSchemes(m.profile || {});
    const est = computeEstimate(res);
    grand += est.total;
    return { name: m.name || (T('member') + ' ' + (i + 1)), n: res.length, strong: res.filter(r => r.verdict === 'high').length, total: est.total, top: res.slice(0, 3).map(r => r.scheme.name) };
  });
  out.innerHTML = `
    <div class="card" style="margin:0">
      <div class="row spread"><h4 style="margin:0">${esc(T('householdTotal'))}</h4><b style="font-size:1.3rem;color:var(--navy)">${fmt(grand)}</b></div>
      <table class="est-table" style="margin-top:10px"><thead><tr>
        <th>${esc(T('member'))}</th><th>${esc(T('matches'))}</th><th class="num">${esc(T('estimateShort'))}</th>
      </tr></thead><tbody>${rows.map(r => `<tr><td><b>${esc(r.name)}</b><br><span class="tiny muted">${r.top.map(esc).join(' · ')}</span></td><td>${r.n} <span class="tiny muted">(${r.strong} ${esc(T('strong'))})</span></td><td class="num">${fmt(r.total)}</td></tr>`).join('')}</tbody></table>
    </div>`;
}
function householdExport() {
  const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');
  const lines = ['BHARAT SETU — HOUSEHOLD BENEFIT PLAN', '====================================', ''];
  let grand = 0;
  for (const [i, m] of STATE.members.entries()) {
    const res = rankSchemes(m.profile || {});
    const est = computeEstimate(res); grand += est.total;
    lines.push(`■ ${m.name || (T('member') + ' ' + (i + 1))} — ${res.length} schemes, est. ${fmt(est.total)}`);
    for (const r of res.filter(x => x.verdict === 'high' || x.verdict === 'mid')) {
      lines.push(`   • ${r.scheme.name} [${r.verdict}] — ${r.scheme.benefit}`);
      lines.push(`     Apply: ${r.scheme.apply_url}`);
    }
    lines.push('');
  }
  lines.push(`HOUSEHOLD TOTAL (estimated): ${fmt(grand)}`);
  lines.push('');
  lines.push('Generated by Bharat Setu · verify on the official portal · 112 emergency · 181 women · 1930 cyber fraud');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain' }));
  a.download = 'bharat-setu-household.txt'; a.click();
  toast(T('saved'));
}

/* ————————————— Assistant ————————————— */
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

function mdToHtml(txt) {
  let h = esc(txt);
  h = h.replace(/^### (.*)$/gm, '<h4>$1</h4>');
  h = h.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  h = h.replace(/_(.+?)_/g, '<i>$1</i>');
  h = h.replace(/^[•\-] (.*)$/gm, '<li>$1</li>');
  h = h.replace(/(<li>[\s\S]*?<\/li>)/g, m => '<ul>' + m + '</ul>');
  h = h.replace(/\n{2,}/g, '</p><p>');
  h = h.replace(/\n/g, '<br>');
  return '<p>' + h + '</p>';
}

function renderChat() {
  const log = $('#chatLog'); if (!log) return;
  if (!STATE.chat.length) {
    log.innerHTML = `<div class="msg bot">${mdToHtml(T('assistantSub'))}</div>`;
    return;
  }
  log.innerHTML = STATE.chat.map(m => `<div class="msg ${m.role}">${m.role === 'bot' ? mdToHtml(m.text) : esc(m.text)}</div>`).join('');
  log.scrollTop = log.scrollHeight;
}

let busy = false;
async function sendChat() {
  const inp = $('#chatInput');
  const q = (inp.value || '').trim();
  if (!q || busy) return;
  inp.value = '';
  inp.style.height = 'auto';
  STATE.chat.push({ role: 'user', text: q });
  STATE.chat = STATE.chat.slice(-40);
  LS.set('chat', STATE.chat);
  renderChat();
  const log = $('#chatLog');
  const pending = document.createElement('div');
  pending.className = 'msg bot'; pending.id = 'pendingMsg'; pending.textContent = T('aiBusy');
  log.appendChild(pending); log.scrollTop = log.scrollHeight;
  busy = true;

  let answer = null, source = null;
  try {
    const p = STATE.profile || {};
    const payload = {
      question: q, lang: STATE.lang, langName: langName(STATE.lang),
      profile: { age: p.age, gender: p.gender, area: p.area, income: p.income, category: p.category, occupation: p.occupation, flags: Object.keys(p.flags || {}) },
    };
    const ctl = new AbortController();
    const to = setTimeout(() => ctl.abort(), 25000);
    const res = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: ctl.signal });
    clearTimeout(to);
    if (res.ok) {
      const j = await res.json();
      if (j && j.answer) { answer = j.answer; source = j.source; }
    }
  } catch (e) { /* offline → fall back */ }

  if (!answer) {
    const off = offlineAnswer(q, STATE.lang, STATE.profile);
    answer = off.text; source = 'offline';
    if (source === 'offline') pending.dataset.fallback = '1';
  }
  pending.remove();
  STATE.chat.push({ role: 'bot', text: answer, source });
  LS.set('chat', STATE.chat);
  renderChat();
  speak(answer);
  busy = false;
}

function initChat() {
  $('#chatForm').addEventListener('submit', e => { e.preventDefault(); sendChat(); });
  $('#chatInput').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); }
  });
  $('#btnMic').addEventListener('click', () => startListen('chatInput'));
  renderChat();
  // Suggestion chips
  const sug = [
    { l: '🌾 PM-Kisan', q: 'What is PM Kisan and how do I apply?' },
    { l: '🏥 Ayushman', q: 'How do I get an Ayushman card? Which documents are needed?' },
    { l: '🎓 Scholarship', q: 'Which scholarships can a student get and how to apply?' },
    { l: '📄 RTI', q: 'How do I file an RTI application?' },
    { l: '👩 Women', q: 'What schemes are available for women and girls?' },
    { l: '⚠️ Fraud', q: 'Someone sent me a link saying my PM Kisan payment is blocked. Is it fraud?' },
  ];
  $('#suggestRow').innerHTML = sug.map(s => `<button data-q="${esc(s.q)}">${s.l}</button>`).join('');
  $('#suggestRow').querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    $('#chatInput').value = b.dataset.q; sendChat();
  }));
}

/* ————————————— Document checker ————————————— */
function buildDocList() {
  const box = $('#docList'); if (!box) return;
  const docs = allDocuments();
  const checked = new Set(STATE.checkedDocs);
  box.innerHTML = docs.map(d => `<label class="chk"><input type="checkbox" data-doc="${esc(d.doc)}" ${checked.has(d.doc) ? 'checked' : ''}><span>${esc(d.doc)} <em class="tiny muted">(${d.schemes.length})</em></span></label>`).join('');
  box.querySelectorAll('input').forEach(i => i.addEventListener('change', () => {
    STATE.checkedDocs = $$('#docList input:checked').map(x => x.dataset.doc);
    LS.set('docs', STATE.checkedDocs);
    renderDocResult();
  }));
}

function renderDocResult() {
  const box = $('#docResult'); if (!box) return;
  const r = docReadiness(STATE.checkedDocs, STATE.profile);
  const verdictLabel = r.verdict === 'ready' ? T('ready') : r.verdict === 'almost' ? T('almost') : T('gaps');
  box.innerHTML = `
    <div class="card">
      <div class="row spread"><h3 style="margin:0">${esc(T('score'))}</h3><b style="font-size:1.6rem;color:var(--navy)">${r.pct}%</b></div>
      <div class="bar" style="margin:10px 0"><i style="width:${r.pct}%"></i></div>
      <p class="small"><b>${esc(verdictLabel)}</b> — ${r.have.length} / ${r.needed.length}</p>
      ${r.missing.length ? `<h4>${esc(T('missingDocs'))}</h4><ul class="small list" style="padding-left:18px">${r.missing.map(d => { const g = docGuide(d); return `<li><b>${esc(d)}</b><br><span class="muted">${esc(T('getDoc'))}: ${esc(g.how)} · ⏱ ${esc(g.time)}</span></li>`; }).join('')}</ul>` : `<p class="small" style="color:var(--ok)">✓ You have everything needed for your matched schemes.</p>`}
    </div>`;
}

/* ————————————— Letters ————————————— */
const LETTER_DOC = {
  rti: `1. Certified copies of the file noting and correspondence on my application dated ______
2. Name and designation of the officer who dealt with it
3. Reason recorded in writing for the delay, if any
4. Copy of the Citizen's Charter / service standard applicable to this matter`,
  grievance: `Date of incident: ______
Office/department involved: ______
Application/reference number: ______
What happened: ______
What action I have already taken: ______
Relief sought: ______`,
  scheme: `Scheme name: ______
My eligibility basis: ______
Application/reference number (if any): ______
Date of application: ______
Documents already submitted: ______
Relief sought: sanction of the scheme benefit`,
  cert: `Certificate required: (Income / Caste / Domicile / Disability) ______
Purpose: ______
Full name, father's name, address, date of birth: ______
Supporting documents attached: ______`,
};

function initLetters() {
  const sel = $('#letterKind');
  const update = () => {
    const k = sel.value;
    $('#letterKindHint').textContent = '';
    if (!$('#letterDetails').value.trim() || $('#letterDetails').dataset.auto === '1') {
      $('#letterDetails').value = LETTER_DOC[k] || '';
      $('#letterDetails').dataset.auto = '1';
    }
  };
  sel.addEventListener('change', update);
  $('#letterDetails').addEventListener('input', () => { $('#letterDetails').dataset.auto = '0'; });
  update();

  $('#btnLetter').addEventListener('click', genLetter);
  $('#btnPrint').addEventListener('click', () => window.print());
  $('#btnCopyLetter').addEventListener('click', () => {
    navigator.clipboard?.writeText(STATE.letter).then(() => toast(T('copy')), () => {});
  });
  $('#btnDlLetter').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([STATE.letter], { type: 'text/plain' }));
    a.download = `bharat-setu-${$('#letterKind').value}.txt`; a.click();
  });
}

async function genLetter() {
  const data = {
    kind: $('#letterKind').value,
    name: $('#lName').value.trim(),
    address: $('#lAddr').value.trim(),
    authority: $('#lAuth').value.trim(),
    subject: $('#lSubject').value.trim(),
    details: $('#letterDetails').value.trim(),
  };
  const out = $('#letterOut');
  out.textContent = T('aiBusy');
  let text = null;
  try {
    const res = await fetch('/api/ai', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'letter', lang: STATE.lang, langName: langName(STATE.lang), letter: data }),
    });
    if (res.ok) { const j = await res.json(); if (j && j.answer) text = j.answer; }
  } catch {}
  if (!text) text = offlineLetter(data.kind, data, STATE.lang);
  STATE.letter = text;
  out.textContent = text;
  speak(STATE.lang === 'en' ? 'Letter generated. You can print or download it now.' : 'पत्र तैयार है। अब आप इसे प्रिंट या डाउनलोड कर सकते हैं।');
  toast(T('saved'));
  $$('#letterOut, .letter-out').forEach(e => e.classList.add('letter-ready'));
}

/* ————————————— Fraud shield ————————————— */
function initFraud() {
  $('#btnFraud').addEventListener('click', runFraud);
}

async function runFraud() {
  const text = $('#fraudText').value.trim();
  if (!text) { toast(T('pasteText')); return; }
  const out = $('#fraudOut');
  out.innerHTML = `<div class="card">${esc(T('aiBusy'))}</div>`;
  let ai = null;
  try {
    const res = await fetch('/api/ai', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'fraud', lang: STATE.lang, langName: langName(STATE.lang), text }),
    });
    if (res.ok) { const j = await res.json(); if (j && j.answer) ai = j.answer; }
  } catch {}
  const local = checkFraud(text);
  const cls = local.verdict === 'danger' ? 'danger' : local.verdict === 'caution' ? 'caution' : 'safe';
  const icon = local.verdict === 'danger' ? '🚨' : local.verdict === 'caution' ? '⚠️' : '✅';
  out.innerHTML = `
    <div class="verdict ${cls}">
      <div class="row spread"><h3 style="margin:0">${icon} ${esc(T('risk'))}: ${local.score}/100</h3></div>
      <div class="bar" style="margin:12px 0"><i style="width:${local.score}%;background:${local.verdict === 'danger' ? 'var(--bad)' : local.verdict === 'caution' ? 'var(--warn)' : 'var(--ok)'}"></i></div>
      ${local.hits.length ? `<h4>Red flags detected</h4><ul class="small list" style="padding-left:18px">${local.hits.map(h => `<li>${esc(h.why)}</li>`).join('')}</ul>` : '<p class="small">No known fraud pattern matched this message.</p>'}
      ${local.safe.length ? `<h4>Positive signals</h4><ul class="small list" style="padding-left:18px">${local.safe.map(h => `<li>${esc(h.why)}</li>`).join('')}</ul>` : ''}
      <h4>What you should do now</h4>
      <ol class="small" style="padding-left:18px">${local.actions.map(a => `<li>${esc(a)}</li>`).join('')}</ol>
      ${ai ? `<h4>AI analysis</h4><div class="small">${mdToHtml(ai)}</div>` : ''}
      <div class="row" style="margin-top:12px">
        <a class="btn btn-solid btn-sm" href="tel:1930">📞 Call 1930 (cyber fraud)</a>
        <a class="btn btn-outline btn-sm" href="https://cybercrime.gov.in" target="_blank" rel="noopener">Report on cybercrime.gov.in</a>
      </div>
    </div>`;
  speak(local.verdict === 'danger' ? 'Danger. This message shows fraud signals. Do not click. Call 1930 immediately.' :
    local.verdict === 'caution' ? 'Caution. This message has some suspicious signs. Verify before acting.' :
    'No strong fraud signals found. Still verify the link yourself.');
  out.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ————————————— Help & glossary ————————————— */
function renderHelp() {
  const c = $('#contacts'); if (!c) return;
  c.innerHTML = CONTACTS.map(x => `<a class="call" href="tel:${x.n.replace(/[^0-9+]/g, '')}">
    <span class="ic">${x.ic}</span><span><b>${esc(x.t)}</b><em>${esc(x.n)}</em></span></a>`).join('');
  const g = $('#glossary'); if (!g) return;
  g.innerHTML = GLOSSARY.map(x => `<div class="kv"><span><b>${esc(x.term)}</b></span><span class="muted small" style="max-width:68%">${esc(x.def)}</span></div>`).join('');
  const tips = [
    'A government office never calls to ask for an OTP, PIN or CVV.',
    'Never pay a "processing fee" to receive a scheme benefit or prize.',
    'Type the official website yourself — do not trust links in SMS/WhatsApp.',
    'Check your name in the official beneficiary list before believing any claim.',
    'Keep your Aadhaar-linked mobile active to receive genuine DBT credits.',
    'For any emergency, dial 112 — it connects police, fire and ambulance.',
  ];
  const tl = $('#tips'); if (tl) tl.innerHTML = tips.map(x => `<li>${esc(x)}</li>`).join('');
}

/* ————————————— Health ping ————————————— */
async function pingAi() {
  try {
    const res = await fetch('/api/ai', { method: 'GET' });
    const j = await res.json();
    const on = !!j.ai_enabled;
    STATE.online = on ? 'online' : 'offline';
    $('#aiPill').textContent = on ? '⚡ ' + T('online') : '📴 ' + T('offline');
    $('#aiPill').className = 'pill ' + (on ? 'ok' : 'off');
  } catch {
    $('#aiPill').textContent = '📴 ' + T('offline');
    $('#aiPill').className = 'pill off';
  }
}

/* ————————————— Boot ————————————— */
function init() {
  // language selector
  const lsel = $('#langSel');
  lsel.innerHTML = LANGS.map(l => `<option value="${l.code}">${l.label}</option>`).join('');
  lsel.value = STATE.lang;
  lsel.addEventListener('change', e => setLang(e.target.value));

  // state select
  $('#stateSel').innerHTML = '<option value="">—</option>' + STATES_LIST.map(s => `<option>${s}</option>`).join('');

  $('#btnTheme').addEventListener('click', toggleTheme);
  $('#btnContrast').addEventListener('click', toggleContrast);
  $('#btnVoice').addEventListener('click', toggleVoice);
  $('#btnAminus').addEventListener('click', () => bumpFont(-8));
  $('#btnAplus').addEventListener('click', () => bumpFont(8));
  const bs = $('#btnSimple'); if (bs) bs.addEventListener('click', toggleSimple);

  // My Plan actions
  const ep = $('#btnExportPlan'); if (ep) ep.addEventListener('click', exportPlan);
  const sp = $('#btnSharePlan'); if (sp) sp.addEventListener('click', sharePlan);
  const pp = $('#btnPrintPlan'); if (pp) pp.addEventListener('click', () => window.print());
  const cp = $('#btnClearPlan'); if (cp) cp.addEventListener('click', () => {
    STATE.plan = {}; STATE.checkedDocs = []; LS.set('plan', {}); LS.set('docs', []);
    buildDocList(); renderDocResult(); renderPlan(); toast(T('clearPlan'));
  });

  $('#btnFind').addEventListener('click', runFind);
  $('#btnDemo').addEventListener('click', () => { fillProfile(DEMO); runFind(); });
  $('#btnReset').addEventListener('click', () => {
    STATE.profile = {}; LS.set('profile', {}); STATE.results = []; STATE.resultsRendered = false;
    fillProfile({}); renderResults(); renderPlan(); toast(T('reset'));
  });
  $$('#view-finder input, #view-finder select').forEach(el => el.addEventListener('change', collectProfile));

  // What-if simulator
  const bw = $('#btnWhatIf'); if (bw) bw.addEventListener('click', () => {
    const c = $('#whatIfCard'); if (c && !c.hidden) { c.hidden = true; return; } openWhatIf();
  });
  const bwc = $('#btnWhatIfClose'); if (bwc) bwc.addEventListener('click', () => { $('#whatIfCard').hidden = true; });
  ['#wiAge', '#wiIncome'].forEach(sel => { const el = $(sel); if (el) el.addEventListener('input', renderWhatIf); });

  // Household
  const bsm = $('#btnSaveMember'); if (bsm) bsm.addEventListener('click', saveMember);
  const bh = $('#btnHouseholdClose'); if (bh) bh.addEventListener('click', () => { $('#householdCard').hidden = true; });
  const bha = $('#btnHouseholdAll'); if (bha) bha.addEventListener('click', householdAll);
  const bhe = $('#btnHouseholdExport'); if (bhe) bhe.addEventListener('click', householdExport);
  const bhc = $('#btnHouseholdClear'); if (bhc) bhc.addEventListener('click', () => {
    STATE.members = []; STATE.activeMember = 0; LS.set('members', []); LS.set('activeMember', 0);
    renderHousehold(); $('#householdOut').innerHTML = ''; toast(T('clearPlan'));
  });
  if (STATE.members.length) { $('#householdCard').hidden = false; renderHousehold(); }

  initNav(); initChat(); initLetters(); initFraud();
  fillProfile(STATE.profile || {});
  applyA11y();
  applyLang();
  renderHelp();
  pingAi();
  window.addEventListener('hashchange', () => { const h = location.hash.replace('#', ''); if ($('#view-' + h)) go(h); });
  window.addEventListener('online', pingAi);
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
}
document.addEventListener('DOMContentLoaded', init);
})();
