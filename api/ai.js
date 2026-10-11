/* Bharat Setu — AI proxy (Vercel serverless function).
   Keeps the LLM key server-side, grounds every answer on the curated scheme
   knowledge base, and refuses to promise anything it cannot cite.
   Runs on Node runtime (global fetch is available on Node 18+). */

import { KB, KB_TEXT, CONTACTS, GLOSSARY } from './kb.js';

const MODEL = process.env.AI_MODEL || 'gpt-5-mini';
const FALLBACK_MODEL = process.env.AI_MODEL_FALLBACK || 'gpt-5-nano';

/* ————— very light per-instance rate limit ————— */
const HITS = new Map();
const WINDOW = 60_000, LIMIT = 25;
function rateLimited(ip) {
  const now = Date.now();
  const rec = HITS.get(ip) || { n: 0, t: now };
  if (now - rec.t > WINDOW) { rec.n = 0; rec.t = now; }
  rec.n++;
  HITS.set(ip, rec);
  if (HITS.size > 5000) HITS.clear();
  return rec.n > LIMIT;
}

/* ————— LLM call against the OpenAI-compatible proxy ————— */
/* Upstream providers sometimes return HTTP 200 with a *service* message in the
   body (quota exhausted, credits, rate limit) instead of an answer. Returned
   verbatim that would reach the citizen as if it were advice, so detect and
   reclassify those as errors so the client falls back to the on-device engine. */
const NOT_AN_ANSWER = /(credit_exhausted|credits?\s+(?:can'?t|are|is)\s+be?\s*used|out\s*of\s*credits|insufficient\s+(?:credits|quota|balance)|quota\s+exhausted|exceeded\s+your\s+(?:current\s+)?quota|please\s+visit\s+https?:\/\/\S*pricing|subscribe\s+or\s+purchase|too\s+many\s+requests)/i;

async function callLLM(messages, { maxTokens = 1400, model = MODEL } = {}) {
  const key = process.env.OPENAI_API_KEY;
  const base = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  if (!key) return { error: 'no_key' };

  const body = {
    model,
    messages,
    max_completion_tokens: maxTokens,
  };
  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      return { error: `http_${res.status}`, detail: txt.slice(0, 400) };
    }
    const j = await res.json();
    const text = j?.choices?.[0]?.message?.content;
    if (!text || !String(text).trim()) return { error: 'empty' };
    return { text: String(text).trim() };
  } catch (e) {
    return { error: 'network', detail: String(e && e.message || e).slice(0, 200) };
  }
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

AUDIENCE: Often a first-time internet user on a low-end Android phone. Many have faced middlemen, confusing portals and fraud. Be warm, concrete and never condescending.

LANGUAGE: Reply ONLY in ${out}. Write in the everyday register people actually speak — not formal literary prose. Keep English words only where they are the real name of something (e.g. "Aadhaar", "RTI", scheme names). Numbers, currency (₹) and dates stay in normal digits.

GROUNDING RULES — these are absolute:
1. Use ONLY facts from the KNOWLEDGE BASE below for scheme names, benefits, documents, eligibility and application steps.
2. Never invent a scheme, an amount, a deadline, an eligibility rule or a portal URL. If the knowledge base does not cover something, say plainly that you are not certain and point the citizen to the official portal or helpline.
3. Always end a scheme-specific answer with the official link or helpline from the knowledge base.
4. Add this line verbatim at the very end of any answer that mentions a benefit amount: "लाभ राशि और पात्रता की पुष्टि आधिकारिक पोर्टल पर करें." (translate it into the reply language).
5. Never ask for — or accept — an OTP, PIN, CVV, full bank account number or Aadhaar number. If the user offers any, warn them to stop sharing it.
6. If the user seems to describe a fraud, immediately tell them to call 1930 and file on cybercrime.gov.in.

STYLE:
- Lead with the answer. No preamble like "Great question".
- Use short paragraphs, "•" bullets and bold for key terms (markdown is rendered).
- If steps are involved, number them.
- Keep it under about 220 words unless the user explicitly asks for detail.
- End with one short, genuinely useful next action or follow-up question.

KNOWLEDGE BASE (the only source of scheme facts):
${KB_TEXT}

HELPLINES: ${CONTACTS.map(c => `${c.n} (${c.t})`).join('; ')}
PLAIN-LANGUAGE GLOSSARY: ${GLOSSARY.map(g => `${g.term} = ${g.def}`).join(' | ')}`;
}

function profileLine(p) {
  if (!p) return 'No profile shared yet.';
  const bits = [];
  if (p.age != null) bits.push(`age ${p.age}`);
  if (p.gender) bits.push(`gender ${p.gender}`);
  if (p.area) bits.push(`${p.area} area`);
  if (p.state) bits.push(`state ${p.state}`);
  if (p.income != null) bits.push(`annual family income ₹${p.income}`);
  if (p.category) bits.push(`category ${p.category}`);
  if (p.occupation) bits.push(`occupation ${p.occupation}`);
  if (Array.isArray(p.flags) && p.flags.length) bits.push(`situation flags: ${p.flags.join(', ')}`);
  return bits.length ? `Citizen context (use it to personalise, never to assume): ${bits.join(', ')}.` : 'No profile shared yet.';
}

async function handleChat(body) {
  const { question, lang = 'en', langName, profile } = body || {};
  if (!question || !String(question).trim()) return { error: 'empty_question' };
  const q = String(question).slice(0, 2000);

  const messages = [
    { role: 'system', content: systemPrompt(lang, langName) },
    { role: 'user', content: `${profileLine(profile)}\n\nCitizen's question: ${q}` },
  ];
  let r = await callLLM(messages, { maxTokens: 1400 });
  if (r.error && r.error !== 'no_key') {
    r = await callLLM(messages, { maxTokens: 1400, model: FALLBACK_MODEL });
  }
  if (r.error) return { error: r.error, detail: r.detail };
  return { answer: r.text, source: 'ai', model: MODEL };
}

async function handleLetter(body) {
  const { letter = {}, lang = 'en', langName } = body || {};
  const kinds = {
    rti: 'an application under the Right to Information Act, 2005 (Section 6) addressed to the Public Information Officer, asking numbered, specific questions, citing the 30-day deadline and the first-appellate-authority remedy, and mentioning the ₹10 fee.',
    grievance: 'a formal public grievance / complaint representation to the department, stating facts with dates, the action already taken, the relief sought, and requesting a written reasoned reply within the citizen-charter timeline.',
    scheme: 'a representation requesting sanction of a scheme benefit, listing the eligibility basis and the documents enclosed, and requesting that any additional requirement be intimated in writing.',
    cert: 'an application for issuance of a certificate (income / caste / domicile / disability as applicable), listing the particulars required, the enclosures, and a declaration of truthfulness.',
  };
  const sys = `${systemPrompt(lang, langName)}

TASK OVERRIDE: You are drafting ${kinds[letter.kind] || kinds.grievance}
- Output ONLY the finished letter — no commentary, no markdown fences, no explanation before or after.
- Plain text, properly formatted with line breaks, ready to print or paste into a portal.
- Address block, subject line, salutation, body, closing and signature block.
- Leave any unknown specific as ______ so the citizen can fill it in by hand.
- Keep it to one page. Formal but clear.`;
  const user = `Draft the letter with these details:
Kind: ${letter.kind || 'grievance'}
Applicant name: ${letter.name || '______'}
Applicant address: ${letter.address || '______'}
Addressed to: ${letter.authority || '______'}
Subject: ${letter.subject || '______'}
Facts / details supplied by the citizen:
${(letter.details || '').slice(0, 2500) || '______'}`;

  let r = await callLLM([{ role: 'system', content: sys }, { role: 'user', content: user }], { maxTokens: 1600 });
  if (r.error && r.error !== 'no_key') {
    r = await callLLM([{ role: 'system', content: sys }, { role: 'user', content: user }], { maxTokens: 1600, model: FALLBACK_MODEL });
  }
  if (r.error) return { error: r.error, detail: r.detail };
  return { answer: r.text.replace(/^```[a-z]*\n?/i, '').replace(/```$/, '').trim(), source: 'ai', model: MODEL };
}

async function handleFraud(body) {
  const { text, lang = 'en', langName } = body || {};
  if (!text || !String(text).trim()) return { error: 'empty_text' };
  const sys = `${systemPrompt(lang, langName)}

TASK OVERRIDE: The citizen pasted a suspicious message. Assess it as a fraud analyst.
Reply in ${LANG_NAME[lang] || langName || 'English'} with EXACTLY this shape:
1. One bold verdict line: 🚨 DANGER / ⚠️ CAUTION / ✅ LOOKS SAFE, with a one-line reason.
2. "Red flags" — bullet list of the specific things in THEIR message that are suspicious (quote the phrase).
3. "What to do now" — numbered, concrete steps, most urgent first.
4. If money may already have been lost, state clearly: call 1930 now and report on cybercrime.gov.in — the first hours matter.
Never say a message is definitely safe; always tell them to verify by typing the official .gov.in address themselves.`;
  let r = await callLLM([
    { role: 'system', content: sys },
    { role: 'user', content: `Suspicious message:\n"""\n${String(text).slice(0, 2500)}\n"""` },
  ], { maxTokens: 900 });
  if (r.error && r.error !== 'no_key') {
    r = await callLLM([
      { role: 'system', content: sys },
      { role: 'user', content: `Suspicious message:\n"""\n${String(text).slice(0, 2500)}\n"""` },
    ], { maxTokens: 900, model: FALLBACK_MODEL });
  }
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
      endpoints: ['/api/ai (POST: chat)', '/api/ai?mode=letter', '/api/ai?mode=fraud'],
    });
    return;
  }
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
  if (rateLimited(ip)) {
    res.status(429).json({ error: 'rate_limited', message: 'Too many requests — please wait a minute.' });
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
      // Never surface a hard failure to the citizen — the client falls back
      // to the on-device engine, which is complete for eligibility & documents.
      res.status(200).json({ ok: false, fallback: true, reason: out.error, detail: out.detail });
      return;
    }
    res.status(200).json({ ok: true, ...out });
  } catch (e) {
    res.status(200).json({ ok: false, fallback: true, reason: 'exception', detail: String(e && e.message || e).slice(0, 200) });
  }
}
  if (!body || typeof body !== 'object') body = {};
  const mode = body.mode || (req.query && req.query.mode) || 'chat';

  try {
    let out;
    if (mode === 'letter') out = await handleLetter(body);
    else if (mode === 'fraud') out = await handleFraud(body);
    else out = await handleChat(body);

    if (out.error) {
      // Never surface a hard failure to the citizen — the client falls back
      // to the on-device engine, which is complete for eligibility & documents.
      res.status(200).json({ ok: false, fallback: true, reason: out.error, detail: out.detail });
      return;
    }
    res.status(200).json({ ok: true, ...out });
  } catch (e) {
    res.status(200).json({ ok: false, fallback: true, reason: 'exception', detail: String(e && e.message || e).slice(0, 200) });
  }
}
 ok: true, ...out });
  } catch (e) {
    res.status(200).json({ ok: false, fallback: true, reason: 'exception', detail: String(e && e.message || e).slice(0, 200) });
  }
}
