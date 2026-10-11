/* Bharat Setu — AI proxy (Vercel serverless function).
 *
 * Keeps the LLM key server-side and grounds every answer on the curated
 * scheme knowledge base so the model can never invent a scheme, an amount
 * or a portal URL. The citizen experience never hard-fails: when no key is
 * configured, or the upstream is rate-limited/quota-exhausted, this handler
 * returns { ok:false, fallback:true } and the client answers from its
 * on-device engine, which fully covers eligibility, documents, letters and
 * fraud checks.
 *
 * Handler signature is the Vercel Node convention: (req, res).
 */

import { KB, KB_TEXT, CONTACTS, GLOSSARY } from './kb.js';

const MODEL = process.env.AI_MODEL || 'gpt-5-mini';
const FALLBACK_MODEL = process.env.AI_MODEL_FALLBACK || 'gpt-5-nano';

/* ————— very light per-instance rate limit (best-effort) ————— */
const HITS = new Map();
const WINDOW = 60_000;
const LIMIT = 25;
function rateLimited(ip) {
  const now = Date.now();
  const rec = HITS.get(ip) || { n: 0, t: now };
  if (now - rec.t > WINDOW) { rec.n = 0; rec.t = now; }
  rec.n += 1;
  HITS.set(ip, rec);
  if (HITS.size > 5000) HITS.clear();
  return rec.n > LIMIT;
}

/* Upstream providers sometimes answer HTTP 200 with a *service* message in the
   body (quota exhausted, credits, rate limits) instead of a completion.
   Returned verbatim it would reach the citizen as if it were advice, so we
   detect those and treat them as errors so the client falls back. */
const NOT_AN_ANSWER =
  /(credit_exhausted|credits?\s+(?:can'?t|are|is)\s+be?\s*used|out\s+of\s+credits|insufficient\s+(?:credits|quota|balance)|quota\s+exhausted|exceeded\s+your\s+(?:current\s+)?quota|please\s+visit\s+https?:\/\/\S*pricing|subscribe\s+or\s+purchase|too\s+many\s+requests|rate\s*limit)/i;

/* ————— LLM call against the OpenAI-compatible endpoint ————— */
async function callLLM(messages, { maxTokens = 1400, model = MODEL } = {}) {
  const key = process.env.OPENAI_API_KEY;
  const base = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
  if (!key) return { error: 'no_key' };

  try {
    const res = await fetch(base + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify({ model, messages, max_completion_tokens: maxTokens }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      return { error: 'http_' + res.status, detail: txt.slice(0, 300) };
    }
    const j = await res.json();
    const text = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
    if (!text || !String(text).trim()) return { error: 'empty' };
    const clean = String(text).trim();
    if (NOT_AN_ANSWER.test(clean)) return { error: 'upstream_unavailable', detail: clean.slice(0, 160) };
    return { text: clean };
  } catch (e) {
    return { error: 'network', detail: String((e && e.message) || e).slice(0, 200) };
  }
}

/* Try the primary model, then the cheap fallback, on any non-fatal error. */
async function callWithFallback(messages, maxTokens) {
  let r = await callLLM(messages, { maxTokens });
  if (r.error && r.error !== 'no_key') {
    r = await callLLM(messages, { maxTokens, model: FALLBACK_MODEL });
  }
  return r;
}

/* ————— prompts ————— */
const LANG_NAME = {
  en: 'English', hi: 'Hindi (हिन्दी)', bn: 'Bengali (বাংলা)', ta: 'Tamil (தமிழ்)',
  te: 'Telugu (తెలుగు)', mr: 'Marathi (मराठी)', gu: 'Gujarati (ગુજરાતી)',
  kn: 'Kannada (ಕನ್ನಡ)', ml: 'Malayalam (മലയാളം)', pa: 'Punjabi (ਪੰਜਾਬੀ)',
  or: 'Odia (ଓଡ଼ିଆ)', as: 'Assamese (অসমীয়া)', ur: 'Urdu (اردو)',
};

function systemPrompt(lang, langName) {
  const out = LANG_NAME[lang] || langName || 'English';
  return `You are "Bharat Setu", a patient, trustworthy assistant that helps ordinary Indian citizens claim the government schemes, benefits and rights they are entitled to.

AUDIENCE: Often a first-time internet user on a low-end Android phone. Many have been cheated by middlemen, confused by portals, or targeted by fraud. Be warm, concrete, never condescending.

LANGUAGE: Reply ONLY in ${out}, in the everyday spoken register — not formal literary prose. Keep English only where it is the real name of something (Aadhaar, RTI, scheme names). Numbers and ₹ stay in normal digits.

GROUNDING RULES (absolute):
1. Use ONLY the facts in the KNOWLEDGE BASE below for scheme names, benefits, documents, eligibility and steps.
2. Never invent a scheme, amount, deadline, eligibility rule or URL. If the base does not cover it, say plainly you are not certain and point to the official portal or helpline.
3. End every scheme-specific answer with the official link or helpline from the base.
4. If the answer mentions a benefit amount, end with this line translated into the reply language: "Verify the benefit amount and eligibility on the official portal."
5. Never ask for or accept an OTP, PIN, CVV, full bank account number or Aadhaar number. If the user offers any, tell them to stop sharing it.
6. If the user describes a possible fraud, immediately tell them to call 1930 and report on cybercrime.gov.in.

STYLE:
- Lead with the answer. No "Great question" preamble.
- Short paragraphs, "•" bullets, **bold** for key terms (markdown is rendered).
- Number the steps when order matters.
- Under about 220 words unless asked for detail.
- End with one short, genuinely useful next action.

KNOWLEDGE BASE (your only source of scheme facts):
${KB_TEXT}

HELPLINES: ${CONTACTS.map((c) => `${c.n} (${c.t})`).join('; ')}
PLAIN-LANGUAGE GLOSSARY: ${GLOSSARY.map((g) => `${g.term} = ${g.def}`).join(' | ')}`;
}

function profileLine(p) {
  if (!p) return 'No profile shared yet.';
  const bits = [];
  if (p.age != null) bits.push('age ' + p.age);
  if (p.gender) bits.push('gender ' + p.gender);
  if (p.area) bits.push(p.area + ' area');
  if (p.state) bits.push('state ' + p.state);
  if (p.income != null) bits.push('annual family income ₹' + p.income);
  if (p.category) bits.push('category ' + p.category);
  if (p.occupation) bits.push('occupation ' + p.occupation);
  if (Array.isArray(p.flags) && p.flags.length) bits.push('situation flags: ' + p.flags.join(', '));
  return bits.length
    ? 'Citizen context (use to personalise, never to assume): ' + bits.join(', ') + '.'
    : 'No profile shared yet.';
}

/* ————— feature handlers ————— */
async function handleChat(body) {
  const { question, lang = 'en', langName, profile } = body || {};
  if (!question || !String(question).trim()) return { error: 'empty_question' };
  const q = String(question).slice(0, 2000);
  const messages = [
    { role: 'system', content: systemPrompt(lang, langName) },
    { role: 'user', content: profileLine(profile) + "\n\nCitizen's question: " + q },
  ];
  const r = await callWithFallback(messages, 1400);
  if (r.error) return { error: r.error, detail: r.detail };
  return { answer: r.text, source: 'ai', model: MODEL };
}

async function handleLetter(body) {
  const { letter = {}, lang = 'en', langName } = body || {};
  const kinds = {
    rti: 'an application under the Right to Information Act, 2005 (Section 6) to the Public Information Officer, with numbered specific questions, citing the 30-day deadline and the first-appellate-authority remedy, and mentioning the ₹10 fee.',
    grievance: 'a formal public grievance to the department stating facts with dates, action already taken, relief sought, and requesting a written reasoned reply within the citizen-charter timeline.',
    scheme: 'a representation requesting sanction of a scheme benefit, listing the eligibility basis and enclosures, and asking that any additional requirement be intimated in writing.',
    cert: 'an application for issuance of a certificate (income / caste / domicile / disability as applicable), listing the particulars, enclosures and a declaration of truthfulness.',
  };
  const sys = `${systemPrompt(lang, langName)}

TASK OVERRIDE: Draft ${kinds[letter.kind] || kinds.grievance}
- Output ONLY the finished letter. No commentary, no markdown fences, no text before or after.
- Plain text, properly formatted with line breaks, ready to print or paste into a portal.
- Address block, subject line, salutation, body, closing, signature block.
- Leave any unknown specific as ______ so the citizen can fill it by hand.
- One page. Formal but clear.`;
  const user = `Draft the letter with these details:
Kind: ${letter.kind || 'grievance'}
Applicant name: ${letter.name || '______'}
Applicant address: ${letter.address || '______'}
Addressed to: ${letter.authority || '______'}
Subject: ${letter.subject || '______'}
Facts / details supplied by the citizen:
${(letter.details || '').slice(0, 2500) || '______'}`;
  const r = await callWithFallback([{ role: 'system', content: sys }, { role: 'user', content: user }], 1600);
  if (r.error) return { error: r.error, detail: r.detail };
  return {
    answer: r.text.replace(/^```[a-z]*\n?/i, '').replace(/```$/, '').trim(),
    source: 'ai',
    model: MODEL,
  };
}

async function handleFraud(body) {
  const { text, lang = 'en', langName } = body || {};
  if (!text || !String(text).trim()) return { error: 'empty_text' };
  const sys = `${systemPrompt(lang, langName)}

TASK OVERRIDE: The citizen pasted a suspicious message. Assess it as a fraud analyst.
Reply in ${LANG_NAME[lang] || langName || 'English'} in EXACTLY this shape:
1. One bold verdict line: 🚨 DANGER / ⚠️ CAUTION / ✅ LOOKS SAFE, with a one-line reason.
2. "Red flags" — bullets quoting the specific suspicious phrases from THEIR message.
3. "What to do now" — numbered, concrete steps, most urgent first.
4. If money may already have been lost, say clearly: call 1930 now and report on cybercrime.gov.in — the first hours matter.
Never declare a message definitely safe; always tell them to verify by typing the official .gov.in address themselves.`;
  const r = await callWithFallback([
    { role: 'system', content: sys },
    { role: 'user', content: 'Suspicious message:\n"""\n' + String(text).slice(0, 2500) + '\n"""' },
  ], 900);
  if (r.error) return { error: r.error, detail: r.detail };
  return { answer: r.text, source: 'ai', model: MODEL };
}

/* ————— handler ————— */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  if (req.method === 'GET') {
    res.status(200).json({
      ok: true,
      ai_enabled: !!process.env.OPENAI_API_KEY,
      model: MODEL,
      schemes: KB.length,
      modes: ['chat', 'letter', 'fraud'],
    });
    return;
  }
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }

  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    (req.socket && req.socket.remoteAddress) ||
    'unknown';
  if (rateLimited(ip)) {
    res.status(429).json({ ok: false, fallback: true, reason: 'rate_limited' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  if (!body || typeof body !== 'object') body = {};

  const mode = body.mode || (req.query && req.query.mode) || 'chat';

  try {
    let out;
    if (mode === 'letter') out = await handleLetter(body);
    else if (mode === 'fraud') out = await handleFraud(body);
    else out = await handleChat(body);

    if (out.error) {
      /* Never surface a hard failure to the citizen — the client falls back to
         the on-device engine, which is complete for eligibility & documents. */
      res.status(200).json({ ok: false, fallback: true, reason: out.error, detail: out.detail });
      return;
    }
    res.status(200).json({ ok: true, answer: out.answer, source: out.source, model: out.model });
  } catch (e) {
    res.status(200).json({
      ok: false, fallback: true, reason: 'exception',
      detail: String((e && e.message) || e).slice(0, 200),
    });
  }
}
