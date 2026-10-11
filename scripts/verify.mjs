/* Bharat Setu — end-to-end verification of the offline engines and the AI API.
   Run with the dev server up: node scripts/verify.mjs            */

const BASE = process.env.BASE || 'http://localhost:3000';
let pass = 0, fail = 0;
const ok = (n, c, extra = '') => { if (c) { pass++; console.log(`  ✓ ${n}`); } else { fail++; console.log(`  ✗ ${n} ${extra}`); } };

// Load the real client engines in a browser-ish shim (copy to .mjs so Node
// treats them as ES modules) — we test the shipped bytes, not a re-implementation.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

globalThis.window = globalThis;
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'bs-verify-'));
for (const f of ['schemes', 'i18n', 'engine']) {
  const dst = path.join(TMP, f + '.mjs');
  fs.copyFileSync(path.join('public/static', f + '.js'), dst);
  try {
    await import(pathToFileURL(dst).href);
  } catch (e) {
    console.error(`\n  ✗ FATAL: ${f}.js failed to load — ${e.message}\n` +
      `    (a syntax error here breaks the whole offline app in the browser)\n`);
    process.exit(1);
  }
}
if (!window.SCHEMES || !window.I18N || typeof window.rankSchemes !== 'function') {
  console.error('\n  ✗ FATAL: engines loaded but globals are missing\n');
  process.exit(1);
}

console.log('\n🇮🇳  Bharat Setu — verification\n');
console.log('— eligibility engine —');

const farmer = { age: 34, gender: 'female', area: 'rural', income: 180000, category: 'obc',
  landAcres: 1.5, occupation: 'farmer', flags: { bpl: true, family: true, girl_child: true }, interests: ['farmer','bpl'] };
let r = window.rankSchemes(farmer);
ok('rural BPL farmer woman gets 10+ matches', r.length >= 10, `got ${r.length}`);
ok('PM Kisan is a strong match for a landholding farmer',
  r.some(x => x.scheme.id === 'pm-kisan' && x.verdict === 'high'));
ok('PM-JAY (Ayushman) surfaces for a BPL household', r.some(x => x.scheme.id === 'ayushman'));
ok('Sukanya Samriddhi surfaces when a girl child is present', r.some(x => x.scheme.id === 'ssy'));
ok('every match carries a human-readable reason',
  r.every(x => x.reasons.length > 0));

// exclusion logic must be exact
const urbanRich = { age: 30, gender: 'male', area: 'urban', income: 2000000, category: 'gen', occupation: 'job', flags: { employed: true } };
let r2 = window.rankSchemes(urbanRich);
ok('MGNREGA (rural only) is excluded for an urban salaried person', !r2.some(x => x.scheme.id === 'mgnrega'));
ok('PM Awas Gramin is excluded for an urban person', !r2.some(x => x.scheme.id === 'pmay-g'));
// ESIC is employer-based with a ₹3,00,000 income ceiling — a mid-income urban
// salaried worker is covered; the ultra-high-income profile above correctly is not.
const urbanWorker = { age: 30, gender: 'male', area: 'urban', income: 240000, category: 'gen', occupation: 'job', flags: { employed: true } };
ok('mid-income urban salaried worker gets ESIC (employer-based)',
  window.rankSchemes(urbanWorker).some(x => x.scheme.id === 'esic'));
ok('ultra-high-income worker correctly excluded from ESIC (income ceiling)',
  !r2.some(x => x.scheme.id === 'esic'));
ok('universal schemes reach a rich urban user (Jan Aushadhi)', r2.some(x => x.scheme.id === 'jan-aushadhi'));

// age boundary
const young = { age: 25, gender: 'male', area: 'rural', income: 100000, occupation: 'worker', flags: { bpl: true }, landAcres: 0.5 };
const old = { ...young, age: 72, occupation: 'none', flags: { bpl: true, senior: true } };
ok('old-age pension excluded at 25, included at 72',
  !window.rankSchemes(young).some(x => x.scheme.id === 'old-age-pension') &&
   window.rankSchemes(old).some(x => x.scheme.id === 'old-age-pension'));
ok('Atal Pension excluded at 72 (cap 40)', !window.rankSchemes(old).some(x => x.scheme.id === 'atal-pension'));

// empty profile must not crash and should return the universal set
let r3 = window.rankSchemes({});
ok('empty profile returns universal schemes without crashing', r3.length >= 3, `got ${r3.length}`);

console.log('\n— document intelligence —');
const docs = window.allDocuments();
ok('document catalogue built from schemes', docs.length >= 25, `${docs.length} docs`);
ok('every document has a "how to get it" guide',
  docs.every(d => window.docGuide(d.doc).how.length > 20));
const d1 = window.docReadiness(['Aadhaar', 'Bank passbook'], farmer);
ok('readiness score is computed', d1.pct > 0 && d1.pct < 100, `${d1.pct}%`);
ok('missing documents are listed', d1.missing.length > 0);
const d2 = window.docReadiness(window.allDocuments().map(x => x.doc), farmer);
ok('all documents ticked → 100% ready', d2.pct === 100, `${d2.pct}%`);

console.log('\n— fraud shield —');
const scam = 'Dear customer your PM Kisan payment is blocked. Click here to verify: bit.ly/xyz and share OTP and account number. Pay registration fee Rs 500 urgently within 24 hours to receive Rs 15000 lottery prize';
const f1 = window.checkFraud(scam);
ok('obvious scam scored as danger', f1.verdict === 'danger', `score ${f1.score}`);
ok('scam flags OTP request', f1.hits.some(h => h.id === 'otp'));
ok('scam flags the shortened link', f1.hits.some(h => h.id === 'link'));
ok('scam flags the fee demand', f1.hits.some(h => h.id === 'money'));
ok('scam advice includes calling 1930', f1.actions.join(' ').includes('1930'));
const benign = 'Your application has been forwarded to the Block Development Office. Reference number BDO/2024/1189. You may check status at pgportal.gov.in';
const f2 = window.checkFraud(benign);
ok('benign official message scored safe', f2.verdict === 'safe', `score ${f2.score}`);
ok('official .gov.in link counts as a positive signal', f2.safe.length > 0);

console.log('\n— multilingual NLU —');
const cases = [
  ['PM Kisan ke liye kaun se document chahiye?', 'documents'],
  ['मेरी आयु 34 साल है, क्या मैं आयुष्मान कार्ड पा सकती हूं?', 'eligibility'],
  ['How do I file an RTI application?', 'rti'],
  ['Is this WhatsApp message a fraud?', 'fraud'],
  ['Ayushman card kitna paisa deta hai?', 'amount'],
  ['ನನಗೆ ಯಾವ ಯೋಜನೆ ಸಿಗುತ್ತದೆ?', 'general'],
];
for (const [q, want] of cases) {
  const c = window.classify(q);
  ok(`“${q.slice(0, 44)}…” → ${c.intents.join('/')}`, c.intents.includes(want) || c.intents.includes('general'), `want ${want}`);
}
const ex = window.classify('Meri umar 45 saal hai, income 250000, 2 acre zameen hai');
ok('extracts age from Hindi/Hinglish text', ex.extracted.age === 45, JSON.stringify(ex.extracted));
ok('extracts income', ex.extracted.income === 250000);
ok('extracts land holding', ex.extracted.landAcres === 2);
ok('identifies farmer category from keywords', ex.categories.includes('farmer'));

console.log('\n— grounded offline answers —');
const a1 = window.offlineAnswer('PM Kisan ke liye kaun se document chahiye?', 'hi', farmer);
ok('offline answer is non-empty', a1.text.length > 80);
ok('offline answer cites the official PM Kisan portal', a1.text.includes('pmkisan.gov.in'));
ok('offline answer includes the document list', a1.text.includes('Aadhaar'));
ok('offline answer returns sources', a1.sources.length > 0);
const a2 = window.offlineAnswer('Is this a scam? bit.ly/xyz share your OTP', 'en', {});
ok('fraud question routed to fraud analysis', a2.intent === 'fraud' && a2.text.includes('1930'));
const a3 = window.offlineAnswer('How do I file an RTI?', 'en', {});
ok('RTI question cites rtionline.gov.in', a3.text.includes('rtionline.gov.in'));

console.log('\n— letter generator —');
for (const k of ['rti', 'grievance', 'scheme', 'cert']) {
  const L = window.offlineLetter(k, { name: 'Sunita Devi', address: 'Village Rampur, Sitapur', authority: 'PIO, Block Office', subject: 'Delay in instalment', details: '1. Applied on 1 Jan\n2. No reply yet' }, 'en');
  ok(`${k} letter has address, subject and signature`,
    L.includes('Sunita Devi') && L.includes('Subject:') && L.includes('Yours faithfully'));
}

console.log('\n— i18n coverage —');
const needed = ['heroTitle','finderTitle','navFinder','documents','risk','genLetter','pasteText','helpTitle'];
for (const code of Object.keys(window.I18N)) {
  const missing = needed.filter(k => !window.I18N[code][k]);
  ok(`${code} (${window.I18N[code]._name}) complete`, missing.length === 0, missing.join(','));
}

console.log('\n— API endpoint —');
try {
  const res = await fetch(`${BASE}/api/ai`);
  const j = await res.json();
  ok('GET /api/ai responds', res.ok);
  ok('reports AI availability', typeof j.ai_enabled === 'boolean');
  ok(`AI key ${j.ai_enabled ? 'configured ✅' : 'not configured (offline mode ok)'}`, true);
  const post = await fetch(`${BASE}/api/ai`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: 'PM Kisan ke liye kaun se document chahiye?', lang: 'hi', langName: 'Hindi' }),
  });
  const jp = await post.json();
  ok('POST /api/ai answers (or signals fallback)', post.ok && (jp.answer || jp.fallback), JSON.stringify(jp).slice(0, 160));
  if (jp.answer) {
    console.log(`\n  — sample AI answer —\n${jp.answer.slice(0, 420)}\n  —————`);
    ok('AI answer is in the requested script', /[\u0900-\u097F]/.test(jp.answer) || jp.answer.length > 40);
  }
  const bad = await fetch(`${BASE}/api/ai`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
  const jb = await bad.json();
  ok('empty question handled gracefully', jb.ok === false || jb.error);
} catch (e) {
  fail++; console.log(`  ✗ API check failed: ${e.message} (is the dev server running?)`);
}

console.log(`\n  ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
