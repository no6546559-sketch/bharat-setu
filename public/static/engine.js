/* Bharat Setu — reasoning engine.
   Runs fully offline: profile→scheme eligibility matching with explainable
   reasons, a multilingual intent classifier, fraud-pattern scoring, document
   readiness scoring, and grounded answer synthesis from the knowledge base. */

/* ————————————————————— 1. ELIGIBILITY ENGINE ————————————————————— */

function _normIncome(v) { const n = Number(v); return isNaN(n) ? null : n; }

/* Evaluate one scheme against a profile.
   Returns { verdict: 'high'|'mid'|'low'|'none', reasons:[], blockers:[] } */
function evaluateScheme(scheme, p) {
  const reasons = [], blockers = [];
  let score = 0, hard = 0;
  const R = scheme.rules || {};

  const ok = (msg, w = 2) => { reasons.push(msg); score += w; };
  const no = (msg, isHard = false) => { blockers.push(msg); if (isHard) hard++; };

  // Category flags present in the profile
  const flags = p.flags || {};
  const has = k => !!flags[k];

  // --- Hard identity checks ---
  if (R.girl_child === true) {
    if (has('girl_child')) ok('There is a girl child under 10 in your family', 3);
    else no('This scheme requires a girl child below 10 years', true);
  }
  if (R.women === true) {
    if (p.gender === 'female') ok('This scheme is for women and you are a woman', 3);
    else if (p.gender === 'other' || p.gender === 'male') no('This scheme is specifically for women', true);
    else no('Confirm your gender — this scheme is for women', false);
  }
  if (R.widow === true) {
    if (flags.widow) ok('You are a widow/widower, which is the target group', 3);
    else no('This scheme is for widows/widowers', true);
  }
  if (R.disability === true) {
    if (flags.disability) ok('A member has 40%+ disability, matching the scheme', 3);
    else no('Requires a disability certificate of 40% or more', true);
  }
  if (R.tb === true) {
    if (flags.tb) ok('Registered as a TB patient, so you qualify', 3);
    else no('Applies to notified TB patients only', true);
  }
  if (R.pregnant === true) {
    if (flags.pregnant) ok('Pregnancy/lactation makes you eligible', 3);
    else no('Applies to pregnant or lactating mothers', true);
  }
  if (R.student === true) {
    if (has('student') || p.occupation === 'student') ok('You are a student, which this scheme supports', 2);
    else no('This scheme is for students only', true);
  }
  if (R.farmer === true) {
    if (p.occupation === 'farmer' || (p.landAcres && p.landAcres > 0)) ok('You are a farmer / landholder', 3);
    else no('This scheme is for farmer families', true);
  }
  if (R.student_or_worker === true) {
    if (has('student') || p.occupation === 'student') ok('Student category qualifies', 2);
    else if (p.occupation === 'worker' || p.occupation === 'job' || has('employed')) ok('Working adult category qualifies', 2);
    else if (p.age != null && p.age >= 15 && p.age <= 45) ok('Your age falls in the eligible training band', 1);
    else no('Open to students and working adults aged 15–45', false);
  }
  if (R.sc_st_or_woman === true) {
    if (p.category === 'sc' || p.category === 'st') ok('SC/ST entrepreneur category qualifies', 3);
    else if (p.gender === 'female') ok('Women entrepreneurs qualify under this scheme', 3);
    else no('Reserved for SC/ST or women entrepreneurs', true);
  }
  if (R.business === true) {
    if (has('business')) ok('You run or plan a small enterprise', 2);
  }
  if (R.worker === true) {
    if (p.occupation === 'worker' || has('employed') || has('business')) ok('Unorganised/working category matches', 2);
    else if (has('bpl')) ok('Low-income worker households are prioritised', 1);
  }
  if (R.employed === true) {
    if (has('employed') || p.occupation === 'job') ok('You are a salaried employee with an employer', 3);
    else no('Requires an employer-employee relationship', true);
  }
  if (R.senior === true) {
    if (has('senior') || (p.age != null && p.age >= 60)) ok('Senior-citizen age criterion met', 3);
    else no('Applies to persons aged 60 and above', true);
  }
  if (R.bpl === true) {
    if (has('bpl')) ok('BPL / low-income household status qualifies you', 2);
    else if (p.income != null && p.income <= 200000) ok('Your stated income is within the low-income limit', 2);
    else no('Priority is given to BPL / low-income households', false);
  }
  if (R.rural === true) {
    if (p.area === 'rural') ok('Rural residence matches the scheme area', 2);
    else if (p.area === 'urban') no('This scheme operates in rural areas', true);
  }
  if (R.urban === true) {
    if (p.area === 'urban') ok('Urban residence matches the scheme area', 2);
    else if (p.area === 'rural') no('This scheme is for urban areas', true);
  }
  if (R.housing === 'kutcha') {
    if (flags.housing) ok('You do not have a pucca house — the core eligibility condition', 3);
    else no('Requires a household without a pucca house', true);
  }

  // --- Soft/quantitative checks ---
  if (R.age) {
    const a = p.age;
    if (a == null) { reasons.push('Confirm your age to finalise this scheme'); }
    else if (a >= R.age[0] && a <= R.age[1]) ok(`Age ${a} is within the eligible band ${R.age[0]}–${R.age[1]}`, 2);
    else no(`Eligible age is ${R.age[0]}–${R.age[1]} years and you stated ${a}`, true);
  }
  if (R.child_age) {
    if (p.childAge == null) reasons.push('Mention the child\u2019s age to confirm');
    else if (p.childAge >= R.child_age[0] && p.childAge <= R.child_age[1]) ok(`Child age ${p.childAge} is within 0–10 years`, 2);
    else no('Applies to a girl child below 10 years', true);
  }
  if (R.land_acres) {
    if (p.landAcres == null) reasons.push('Add your land holding to confirm this one');
    else if (p.landAcres >= R.land_acres[0] && p.landAcres <= R.land_acres[1]) ok(`Land holding ${p.landAcres} acre(s) is within limits`, 2);
    else no(`Land must be between ${R.land_acres[0]} and ${R.land_acres[1]} acres`, true);
  }
  const inc = _normIncome(p.income);
  if (R.income_max != null) {
    if (inc == null) reasons.push('Income limit applies — add your annual income to verify');
    else if (inc <= R.income_max) ok(`Annual income ₹${inc.toLocaleString('en-IN')} is under the ₹${R.income_max.toLocaleString('en-IN')} limit`, 2);
    else no(`Income limit is ₹${R.income_max.toLocaleString('en-IN')}/year`, true);
  }
  if (R.max_income != null) {
    if (inc == null) reasons.push('Income ceiling applies — add your annual income');
    else if (inc <= R.max_income) ok(`Income is within the ₹${R.max_income.toLocaleString('en-IN')} ceiling`, 1);
    else no(`Income ceiling of ₹${R.max_income.toLocaleString('en-IN')} exceeded`, true);
  }
  if (R.age_min_any != null && (p.age != null && p.age >= R.age_min_any)) {
    ok(`Citizens aged ${R.age_min_any}+ are covered regardless of income`, 3);
  }

  // Universal schemes
  if (R.any === true) { ok('Open to every citizen — no income or category bar', 2); }

  // Category interest from the tick-boxes gives extra relevance
  const interest = p.interests || [];
  const overlap = (scheme.cats || []).filter(c => interest.includes(c));
  if (overlap.length) { ok(`Matches your stated need: ${overlap.map(c => CATEGORY_LABELS[c] || c).join(', ')}`, 2); }

  // Verdict
  if (hard > 0) return { verdict: 'none', reasons, blockers };
  if (score >= 6) return { verdict: 'high', reasons, blockers };
  if (score >= 3) return { verdict: 'mid', reasons, blockers };
  if (score >= 1) return { verdict: 'low', reasons, blockers };
  return { verdict: 'none', reasons, blockers };
}

function rankSchemes(profile) {
  const out = [];
  for (const s of SCHEMES) {
    const r = evaluateScheme(s, profile);
    if (r.verdict === 'none') continue;
    out.push({ scheme: s, ...r, score: r.reasons.length * 2 - r.blockers.length });
  }
  const w = { high: 2, mid: 1, low: 0 };
  out.sort((a, b) => (w[b.verdict] - w[a.verdict]) || (b.score - a.score));
  return out;
}

/* ————————————————————— 2. DOCUMENT INTELLIGENCE ————————————————————— */

const DOC_GUIDE = {
  "Aadhaar": { how: "Enrol free at any Aadhaar Seva Kendra or bank/post-office centre; download the e-Aadhaar from uidai.gov.in. Update mobile number to receive OTPs.", time: "1–15 days" },
  "Land record (khatauni / 7-12 extract)": { how: "Get a certified copy from your Tehsil / Talathi office or the state land-records portal (Bhulekh / Dharani / AnyROR).", time: "Same day – 1 week" },
  "Bank passbook": { how: "Open a zero-balance account under Jan Dhan at any bank, or get the passbook updated at your branch / print the e-passbook.", time: "Same day" },
  "Mobile number linked to Aadhaar": { how: "Visit an Aadhaar centre with your Aadhaar to link/update the mobile number — most DBT schemes need it for OTP.", time: "Same day" },
  "Ration card / BPL proof": { how: "Apply at the district Food & Civil Supplies office or the state PDS portal; carry residence proof and Aadhaar of all members.", time: "15–30 days" },
  "Income certificate": { how: "Apply on your state e-District portal (or CSC) with a self-declaration and salary/produce proof; the Tehsildar/Revenue office issues it.", time: "7–15 days" },
  "Residence proof": { how: "Electricity bill, rent agreement, or a domicile certificate from the Tehsil office.", time: "1–7 days" },
  "Caste certificate (SC/ST/OBC)": { how: "Apply on the state e-District portal with your father's caste certificate and school records; the Sub-Divisional Magistrate issues it.", time: "15–30 days" },
  "Age proof": { how: "Birth certificate from the municipal registrar, Class 10 certificate, or a school leaving certificate.", time: "1–15 days" },
  "Disability certificate (UDID)": { how: "Register on the UDID portal, get assessed by the medical board at a government hospital, then download the UDID card.", time: "15–45 days" },
  "Land record": { how: "Certified copy from the Tehsil / Talathi office or the state land-records portal.", time: "Same day – 1 week" },
  "Photograph": { how: "Any passport-size photo; many CSC centres will take one for a small fee.", time: "Same day" },
  "Job card / SECC listing": { how: "Apply for an MGNREGA job card at your Gram Panchayat (free, issued within 15 days).", time: "15 days" },
  "Aadhaar (60+)": { how: "Your existing Aadhaar works; carry it to the ALIMCO camp for age verification.", time: "Have it already" },
  "Birth certificate of girl": { how: "Get it from the municipal registrar where the birth was registered; if unregistered, apply for late registration.", time: "7–30 days" },
  "Bank account in the girl's name": { how: "Open a minor account with the guardian at any bank — carry the birth certificate and guardian's KYC.", time: "Same day" },
  "MCP card": { how: "Issued free by the ASHA / ANM at your first antenatal visit; keep it for all check-ups.", time: "Same day" },
  "Death certificate of spouse": { how: "Apply at the municipal registrar / Gram Panchayat where the death occurred, or via the civil registration portal.", time: "7–15 days" },
  "Certificate of Vending / ULB recommendation": { how: "Apply to your Urban Local Body for a Certificate of Vending or a letter of recommendation for street vendors.", time: "15–30 days" },
  "UAN": { how: "Ask your employer for the UAN, or retrieve it from the EPFO member portal using your Aadhaar/PAN.", time: "1–7 days" },
  "PAN": { how: "Apply online at incometax.gov.in (e-PAN in a few days) or through a CSC — carry Aadhaar and photographs.", time: "3–15 days" },
  "Doctor's prescription (no documents needed for purchase)": { how: "Nothing needed beyond a valid prescription from a registered doctor.", time: "—" },
  "None — just call": { how: "Nothing needed. Dial the number directly from any phone, free of cost.", time: "Instant" },
  "Business plan / quotation": { how: "Write a one-page plan with cost estimates; machinery quotations can be collected from dealers or MSME-DI.", time: "1–3 days" },
  "Project report": { how: "Prepare a simple project report; your bank or the KVIC/DIC office can share a template.", time: "2–5 days" },
  "Bank statement": { how: "Download the last 6 months' statement from net banking or ask the branch to print and stamp it.", time: "Same day" },
  "Education certificate": { how: "Attach your highest marksheet/certificate or a bonafide certificate from the institution.", time: "Same day" },
  "Self-declaration of no pucca house": { how: "A signed self-declaration is accepted — format is available at the ULB office or the PMAY portal.", time: "Same day" },
  "Educational certificates": { how: "Carry originals plus photocopies of your highest qualification for verification.", time: "Same day" },
  "Rural residence / MGNREGA job card": { how: "Gram Panchayat residence certificate or your MGNREGA job card.", time: "Same day – 15 days" },
  "TB notification at the health facility": { how: "Visit any government health facility; TB notification is entered on the Ni-kshay portal by the treating doctor.", time: "Same day" },
  "Employer IP registration": { how: "Your employer registers you as an Insured Person on the ESIC portal; ask HR for the IP number.", time: "1–7 days" },
  "Consent-cum-auto-debit form": { how: "Available at your bank branch or on the Jansuraksha portal; sign and submit once.", time: "Same day" },
  "Auto-debit consent form": { how: "Available at your bank branch or on the Jansuraksha portal; sign and submit once.", time: "Same day" },
  "Photograph of family members": { how: "Passport-size photos of dependants for the ESIC family record.", time: "Same day" },
  "Nominee details": { how: "Name, relationship and date of birth of the nominee — no separate document needed.", time: "Instant" },
  "Mobile number": { how: "Any active mobile number works; keep it linked to Aadhaar for OTPs.", time: "Instant" },
  "Signature": { how: "Sign in blue/black ink where indicated on the printed form.", time: "Instant" },
  "Photograph (passport size)": { how: "Recent passport-size photo.", time: "Same day" },
  "Bank account": { how: "Any savings account in your name; keep the passbook and account number handy.", time: "Same day" },
  "Aadhaar of all members": { how: "Copies of Aadhaar for every family member listed on the card.", time: "Have it already" },
  "Aadhaar of guardian": { how: "Guardian's Aadhaar copy for the child's account/application.", time: "Have it already" },
  "Aadhaar of parents & child": { how: "Aadhaar copies for mother, father and the child (apply for the child's Aadhaar if missing).", time: "1–15 days" },
  "Aadhaar (for DigiLocker sign-up)": { how: "Any Aadhaar works — DigiLocker sign-up needs the Aadhaar-linked mobile for OTP.", time: "Instant" },
  "Birth certificate & address proof (for passport)": { how: "Birth certificate from the registrar plus any address proof (Aadhaar, electricity bill, rent agreement).", time: "1–15 days" },
  "Address proof": { how: "Electricity bill, water bill, ration card, rent agreement or Aadhaar.", time: "Same day" },
  "Ration card / village residence proof": { how: "Ration card or a Gram Panchayat residence certificate.", time: "1–15 days" },
  "Gram Panchayat request": { how: "A written application to the Gram Panchayat for a new water connection.", time: "Same day" },
  "TB notification": { how: "The treating government facility notifies you on the Ni-kshay portal — ask them to confirm.", time: "Same day" },
};
function docGuide(name) {
  if (DOC_GUIDE[name]) return DOC_GUIDE[name];
  for (const k of Object.keys(DOC_GUIDE)) {
    if (name.toLowerCase().includes(k.toLowerCase().slice(0, 12))) return DOC_GUIDE[k];
  }
  return { how: "Ask at your nearest CSC (Common Service Centre), Gram Panchayat or Tehsil office — they will tell you the exact issuing authority for your district.", time: "Varies" };
}

function allDocuments() {
  const set = new Map();
  for (const s of SCHEMES) for (const d of (s.docs || [])) {
    if (!set.has(d)) set.set(d, { doc: d, schemes: [] });
    set.get(d).schemes.push(s.name);
  }
  return [...set.values()];
}

function docReadiness(checked, profile) {
  const profileDocs = new Set();
  for (const s of SCHEMES) {
    const r = evaluateScheme(s, profile || {});
    if (r.verdict === 'high' || r.verdict === 'mid') (s.docs || []).forEach(d => profileDocs.add(d));
  }
  if (!profileDocs.size) SCHEMES.forEach(s => (s.docs || []).forEach(d => profileDocs.add(d)));
  const needed = [...profileDocs];
  const have = needed.filter(d => checked.includes(d));
  const missing = needed.filter(d => !checked.includes(d));
  const pct = needed.length ? Math.round((have.length / needed.length) * 100) : 0;
  return { needed, have, missing, pct, verdict: pct >= 85 ? 'ready' : pct >= 50 ? 'almost' : 'gaps' };
}

/* ————————————————————— 3. FRAUD SHIELD ————————————————————— */

const FRAUD_RULES = [
  { id: 'otp', w: 30, re: /\b(otp|cvv|pin|password|upi\s*pin)\b/i, why: 'Asks for an OTP, PIN, CVV or password — no government office or bank ever asks for these.' },
  { id: 'urgent', w: 14, re: /\b(urgent|immediately|within\s*24\s*hours|last\s*date|aaj\s*hi|turant|abhi|immediately\s*block|account\s*block|blocked)\b/i, why: 'Creates artificial urgency to stop you from verifying.' },
  { id: 'link', w: 16, re: /(bit\.ly|tinyurl|t\.co|cutt\.ly|rb\.gy|is\.gd|shorturl|ow\.ly|\b[a-z0-9.-]+\.(tk|ml|ga|cf|gq|xyz|top|online|site|click|link)\b)/i, why: 'Uses a shortened or throwaway domain — a common sign of a phishing link.' },
  { id: 'money', w: 20, re: /\b(registration\s*fee|processing\s*fee|pay\s*(₹|rs|inr)?\s*\d|transfer\s*(₹|rs|inr)?\s*\d|security\s*deposit|advance\s*payment|deposit\s*(₹|rs|inr))\b/i, why: 'Asks YOU to pay to receive a benefit. Genuine schemes never charge for releasing your own money.' },
  { id: 'lottery', w: 22, re: /\b(lottery|jackpot|kbc| lucky\s*draw|winner|crorepati|prize\s*money|you\s*have\s*won)\b/i, why: 'Prize/lottery claims delivered by SMS or WhatsApp are almost always scams.' },
  { id: 'apk', w: 18, re: /\b(apk|install\s*this\s*app|download\s*(the\s*)?app\s*from|side.?load|anydesk|teamviewer|screen\s*shar)\b/i, why: 'Pushing an APK or screen-sharing app lets the fraudster take control of your phone.' },
  { id: 'bankAcc', w: 12, re: /\b(account\s*number|ifsc|aadhaar\s*number|card\s*number|debit\s*card|12\s*digit)\b/i, why: 'Asks for full bank/card/Aadhaar numbers — share these only inside a verified official portal.' },
  { id: 'impersonate', w: 12, re: /\b(pm\s*kisan|ayushman|pmjay|uidai|epfo|income\s*tax|nitin\s*gadkari|modi|govt\s*officer|sbi|hdfc|paytm|phonepe|gpay|trai|npc[iı])\b/i, why: 'Impersonates a known department, bank or brand to borrow their trust.' },
  { id: 'jobScam', w: 18, re: /\b(work\s*from\s*home|earn\s*(₹|rs)?\s*\d+\s*(per|\/)\s*day|part\s*time\s*job|data\s*entry\s*job|no\s*experience\s*required|daily\s*payment)\b/i, why: 'Guaranteed high earnings for simple work with no interview is a classic job scam.' },
  { id: 'govtSchemeClaim', w: 16, re: /\b(free\s*(laptop|mobile|recharge|cycle)|yojana\s*(me|ke)\s*(free|fayda)|apply\s*for\s*\d+\s*rupees|₹\s*\d{4,}\s*(free|muft))\b/i, why: '"Free laptop/mobile/bonus" schemes circulated on WhatsApp are fake — verify only on the official portal.' },
  { id: 'grammar', w: 6, re: /\b(dear\s*customer|respected\s*customer|dear\s*beneficiary|click\s*here\s*to\s*(claim|verify|update))\b/i, why: 'Generic mass-mailing language with no case-specific detail.' },
  { id: 'whatsappOnly', w: 8, re: /\b(whatsapp|telegram)\b/i, why: 'Official departments never transact scheme benefits over WhatsApp/Telegram groups.' },
];

const SAFE_RULES = [
  // A genuine government domain is a positive signal. The negative lookahead
  // stops a phishing domain such as "pmkisan.gov.in.xyz" from counting as safe.
  { id: 'officialDomain', w: -15, re: /\b(?:https?:\/\/)?(?:[\w-]+\.)+(?:gov|nic)\.in(?![\w.-])/i, why: 'Mentions an official .gov.in / .nic.in government domain, which is a good sign — but always type it yourself rather than trusting a link.' },
];

function checkFraud(text) {
  const hits = [];
  let score = 0;
  for (const r of FRAUD_RULES) {
    if (r.re.test(text)) { hits.push(r); score += r.w; }
  }
  const goods = [];
  for (const r of SAFE_RULES) {
    if (r.re.test(text)) { goods.push(r); score += r.w; }
  }
  score = Math.max(0, Math.min(100, score));
  const verdict = score >= 60 ? 'danger' : score >= 30 ? 'caution' : 'safe';
  const actions = [];
  if (verdict !== 'safe') {
    actions.push('Do not reply, do not click the link, and do not install any app.');
    actions.push('If you already shared details or lost money, call 1930 immediately and file a report on cybercrime.gov.in — the first few hours matter most.');
    if (hits.some(h => h.id === 'otp' || h.id === 'bankAcc')) actions.push('Inform your bank, block the card/UPI, and change your passwords.');
    actions.push('Verify any scheme claim only on the official portal (a .gov.in website) or at your Gram Panchayat / CSC.');
    actions.push('Report the number to the Sanchar Saathi portal (sancharsaathi.gov.in) and mark it as spam.');
  } else {
    actions.push('No strong fraud signals found. Still verify any link by typing the official .gov.in address yourself.');
    actions.push('Never pay a "processing fee" to receive a government benefit.');
  }
  return { score, verdict, hits, safe: goods, actions };
}

/* ————————————————————— 4. MULTILINGUAL NLU ————————————————————— */

const INTENTS = [
  { id: 'eligibility', re: /(eligib|qualify|kya\s*main|क्या मैं|पात्र|सुनिश्च|যোগ্য|தகுதி|అర్హ|ಪಾತ್ರ|യോഗ്യ|પાત્ર|ਪਾਤਰ|ଯୋଗ୍ୟ|যোগ্য|اہل|am i|kya mujhe|milega|मिलेगा)/i },
  { id: 'documents', re: /(document|documentation|paper|kagaz|कागज|दस्तावेज़|দস্তাবেজ|ஆவண|పత్ర|ದಾಖಲೆ|രേഖ|દસ્તાવેજ|ਦਸਤਾਵੇਜ਼|ନଥି|নথি|دستاویز|proof|certificate required|कौन से)/i },
  { id: 'howto', re: /(how\s*to|kese|kaise|कैसे|कसा|কিভাবে|எப்படி|ఎలా|ಹೇಗೆ|എങ്ങനെ|કેવી|ਕਿਵੇਂ|କିପରି|কেনেকৈ|کیسے|apply|aavedan|आवेदन|procedure|process)/i },
  { id: 'status', re: /(status|track|pending|kitne din|कितने दिन|कब तक|how long|kitna time|नहीं आया|kab aayega|check)/i },
  { id: 'amount', re: /(how much|kitna|कितना|किती|কত|எவ்வளவு|ఎంత|ಎಷ್ಟು|എത്ര|કેટલું|ਕਿੰਨਾ|କେତେ|কিমান|کتنا|amount|paisa|पैसा|benefit|labh|लाभ|राशि)/i },
  { id: 'grievance', re: /(complaint|shikayat|शिकायत|grievance|not\s*received|nahi mila|नहीं मिला|rejected|अस्वीकृत|problem|corrupt|bribe|रिश्वत|official.*not)/i },
  { id: 'rti', re: /(rti|right\s*to\s*information|सूचना का अधिकार|information\s*seek|file.*noting|jaankari|जानकारी)/i },
  { id: 'fraud', re: /(fraud|scam|dhokha|धोखा|cheating|fake|nakli|नकली|पतर|फ्रॉड|is it real|sahi hai|सही है|verify.*link)/i },
  { id: 'complaintEscalate', re: /(escalat|appeal|apeel|अपील|senior\s*officer|district\s*collector|dm se|उच्च अधिकारी)/i },
  { id: 'health', re: /(hospital|ilaaj|इलाज|treatment|doctor|dawai|दवा|medicine|bimari|बीमारी|health|surgery|operação|operation)/i },
  { id: 'education', re: /(scholarship|padhai|पढ़ाई|admission|fees|शिक्षा|education|college|school|hostel)/i },
  { id: 'employment', re: /(job|naukri|नौकरी|rozgar|रोजगार|employment|kaam|काम|training|skill)/i },
  { id: 'pension', re: /(pension|पेंशन|पेन्शन|पेंশন|penshan|retirement|old age|vridh|वृद्ध)/i },
  { id: 'agriculture', re: /(kisan|किसान|farmer|kheti|खेती|fasal|फसल|crop|खाद|fertiliser|मंडी|mandi)/i },
  { id: 'housing', re: /(awas|आवास|ghar|घर|house|housing|makan|मकान|rent|toilet|शौचालय)/i },
  { id: 'women', re: /(mahila|महिला|women|lady|beti|बेटी|girl|ladki|लड़की|kanya|कन्या|widow|विधवा|maternity|गर्भ)/i },
  { id: 'water', re: /(water|paani|पानी|jal|जल|tap|nal|नल|drinking)/i },
  { id: 'help', re: /(helpline|number|contact|kaha jaun|कहां जाऊं|office|kacheri|कचहरी|csc|panchayat)/i },
  { id: 'greeting', re: /^\s*(hi|hello|hey|namaste|नमस्ते|नमस्कार|வணக்கம்|నమస్కారం|ನಮಸ್ಕಾರ|നമസ്കാരം|નમસ્તે|ਨਮਸਤੇ|ନମସ୍କାର|নমস্কাৰ|السلام|adaab|jai hind)\b/i },
];

const CATEGORY_KEYWORDS = {
  farmer: /(kisan|farmer|kheti|खेती|किसान|fasal|crop|land|zameen|जमीन|विদায়|விவசாய)/i,
  student: /(student|scholarship|padhai|छात्र|पढ़ाई|வித்யார்த்தி|విద్యార్థి|ವಿದ್ಯಾರ್ಥಿ|ছাত্র)/i,
  women: /(woman|women|mahila|महिला|beti|बेटी|ladki|लड़की|girl|sister|bhabhi|maternity|widow)/i,
  senior: /(old|senior|budhe|बुज़ुर्ग|वृद्ध|वयोवृद्ध|60|pension|penshan)/i,
  disability: /(disab|divyang|दिव्यांग|viklang|विकलांग|handicap|blind|deaf)/i,
  health: /(health|hospital|ilaaj|इलाज|bimari|बीमारी|treatment|medicine|dawai)/i,
  housing: /(ghar|घर|house|awas|आवास|makan|मकान|roof|chhat)/i,
  employment: /(job|naukri|नौकरी|rozgar|रोजगार|kaam|काम|work|employment)/i,
  business: /(business|dukan|दुकान|vyapar|व्यापार|loan|karz|कर्ज|mudra|shop|vendor|rehdi)/i,
  food: /(ration|राशन|khaana|खाना|food|grain|anaaj|अनाज)/i,
  water: /(water|paani|पानी|jal|जल|nal|नल)/i,
  pension: /(pension|पेंशन|पेन्शन|retirement)/i,
  insurance: /(insurance|bima|बीमा|cover|policy)/i,
  education: /(education|school|college|padhai|पढ़ाई|scholarship)/i,
  skill: /(skill|training|prashikshan|प्रशिक्षण|course|siksha|सीख)/i,
  safety: /(fraud|safety|cyber|police|thana|थाना|helpline|complaint)/i,
  rights: /(rti|right|adhikar|अधिकार|grievance|shikayat|शिकायत)/i,
};

const NUM_WORDS = { 'ek':1,'one':1,'do':2,'two':2,'teen':3,'three':3,'char':4,'chaar':4,'four':4,'panch':5,'paanch':5,'five':5,'chhah':6,'six':6,'saat':7,'seven':7,'aath':8,'eight':8,'nau':9,'nine':9,'das':10,'ten':10 };

function classify(text) {
  const intents = INTENTS.filter(i => i.re.test(text)).map(i => i.id);
  const cats = Object.keys(CATEGORY_KEYWORDS).filter(k => CATEGORY_KEYWORDS[k].test(text));
  const schemes = SCHEMES.filter(s =>
    text.toLowerCase().includes(s.name.toLowerCase()) ||
    text.toLowerCase().includes(s.id.replace(/-/g, ' ')) ||
    (s.name_hi && text.includes(s.name_hi)) ||
    (s.cats || []).some(c => cats.includes(c))
  ).slice(0, 5);

  // Extract a few numbers that look like age / income
  const ageM = text.match(/\b(\d{1,2})\s*(years?|saal|साल|वर्ष|वयस्|বছর|வயது|వయసు|ವರ್ಷ|വയസ്സ|વર્ષ|ਵਰਸ਼|ବର୍ଷ|বছৰ|سال)\b/i)
    || text.match(/\b(?:age|umar|उम्र|आयु)\D{0,6}(\d{1,2})\b/i);
  const incM = text.match(/(?:income|aay|आय|kamai|कमाई|salary|tankha)\D{0,12}([\d,]{3,})/i);
  const landM = text.match(/(\d+(?:\.\d+)?)\s*(acre|ekad|एकड़|bigha|बीघा)/i);
  const extracted = {};
  if (ageM) extracted.age = parseInt(ageM[1], 10);
  if (incM) extracted.income = parseInt(incM[1].replace(/,/g, ''), 10);
  if (landM) { extracted.landAcres = parseFloat(landM[1]); }

  return { intents: intents.length ? intents : ['general'], categories: cats, schemes, extracted };
}

/* ————————————————————— 5. GROUNDED ANSWER SYNTHESIS ————————————————————— */

function officialFor(scheme) { return scheme.apply_url; }

function buildEvidence(intents, cats, limit = 6) {
  let pool = SCHEMES;
  if (cats.length) {
    const filtered = SCHEMES.filter(s => (s.cats || []).some(c => cats.includes(c)));
    if (filtered.length >= 2) pool = filtered;
  }
  const intentsCats = { health: 'health', education: 'education', employment: 'employment', pension: 'pension', agriculture: 'farmer', housing: 'housing', women: 'women', water: 'water', fraud: 'safety', rti: 'rights' };
  const extra = intents.map(i => intentsCats[i]).filter(Boolean);
  if (extra.length) {
    const f2 = SCHEMES.filter(s => (s.cats || []).some(c => extra.includes(c)));
    if (f2.length >= 2) pool = pool.filter(s => f2.includes(s)).length >= 2 ? pool.filter(s => f2.includes(s)) : f2;
  }
  return pool.slice(0, limit);
}

/* Create a structured, citation-safe answer purely from the knowledge base.
   Used when no LLM key is available, and also as grounding context for the LLM. */
function offlineAnswer(question, lang, profile) {
  const c = classify(question);
  const L = lang;
  const T = k => t(k, L);
  const parts = [];

  if (c.intents.includes('greeting') && c.intents.length === 1) {
    return { text: `${t('heroTitle', L)}\n\n${t('heroSub', L)}\n\n${t('askAssistant', L)}: ${t('finderTitle', L)} — ${t('navFinder', L)}.`, sources: [], intent: 'greeting' };
  }

  if (c.intents.includes('fraud') && /(link|sms|message|whatsapp|call|verify)/i.test(question)) {
    const f = checkFraud(question);
    parts.push(`**${T('risk')}: ${f.score}/100**`);
    if (f.hits.length) parts.push(f.hits.map(h => `• ${h.why}`).join('\n'));
    parts.push(f.actions.join('\n'));
    return { text: parts.join('\n\n'), sources: [{ n: '1930', u: 'https://cybercrime.gov.in', t: 'Cyber fraud helpline & reporting' }], intent: 'fraud' };
  }

  const ev = buildEvidence(c.intents, c.categories, 5);

  if (c.intents.includes('eligibility') || c.intents.includes('amount') || c.intents.includes('documents') || c.intents.includes('howto')) {
    if (ev.length) {
      for (const s of ev.slice(0, 4)) {
        const line = [];
        line.push(`### ${L === 'hi' && s.name_hi ? s.name_hi : s.name}`);
        line.push(`**${T('benefit')}:** ${L === 'hi' && s.benefit_hi ? s.benefit_hi : s.benefit}`);
        if (c.intents.includes('documents')) line.push(`**${T('documents')}:** ${(s.docs || []).join(', ')}`);
        if (c.intents.includes('howto') || c.intents.includes('eligibility')) line.push(`**${T('howApply')}:** ${(s.how || []).map((h, i) => `${i + 1}. ${h}`).join(' ')}`);
        line.push(`**${T('official')}:** ${s.apply_url}`);
        parts.push(line.join('\n'));
      }
      if (c.extracted && Object.keys(c.extracted).length) {
        parts.push(`_${JSON.stringify(c.extracted)}_`);
      }
      return { text: parts.join('\n\n'), sources: ev.map(s => ({ n: s.name, u: s.apply_url, t: s.tag })), intent: c.intents[0] };
    }
  }

  if (c.intents.includes('rti')) {
    const rti = SCHEMES.find(s => s.id === 'rti');
    parts.push(`**${rti.name}**\n${rti.desc}\n\n${rti.how.map((h, i) => `${i + 1}. ${h}`).join('\n')}\n\n${T('official')}: ${rti.apply_url}`);
    return { text: parts.join('\n'), sources: [{ n: rti.name, u: rti.apply_url, t: rti.tag }], intent: 'rti' };
  }
  if (c.intents.includes('grievance')) {
    const g = SCHEMES.filter(s => ['cpgrams', 'cybercrime', '181-112'].includes(s.id));
    for (const s of g) parts.push(`### ${s.name}\n${s.desc}\n${s.how.join(' ')}\n${s.apply_url}`);
    return { text: parts.join('\n\n'), sources: g.map(s => ({ n: s.name, u: s.apply_url, t: s.tag })), intent: 'grievance' };
  }
  if (c.intents.includes('help')) {
    parts.push(`**${T('helpTitle')}**\n${CONTACTS.map(c2 => `• **${c2.n}** — ${c2.t}`).join('\n')}`);
    return { text: parts.join('\n'), sources: [{ n: '112', u: 'https://112.gov.in', t: 'Emergency' }], intent: 'help' };
  }
  if (c.intents.includes('status')) {
    parts.push(`**Typical timelines & how to track:**`);
    parts.push(ev.slice(0, 4).map(s => `• **${s.name}** — apply at ${s.apply_url} and keep the acknowledgement/reference number.`).join('\n'));
    parts.push(`If your application is delayed beyond the stated time, file a grievance on pgportal.gov.in and quote your reference number — you can escalate to the next level if the reply is unsatisfactory.`);
    return { text: parts.join('\n\n'), sources: ev.slice(0, 3).map(s => ({ n: s.name, u: s.apply_url, t: s.tag })), intent: 'status' };
  }

  // Fallback: broad list of relevant schemes
  parts.push(`**${T('resultsFor')}**`);
  parts.push((ev.length ? ev : SCHEMES.slice(0, 5)).map(s => `• **${s.name}** — ${s.benefit}\n  ${s.apply_url}`).join('\n'));
  return { text: parts.join('\n\n'), sources: (ev.length ? ev : SCHEMES.slice(0, 4)).map(s => ({ n: s.name, u: s.apply_url, t: s.tag })), intent: c.intents[0] };
}

/* Letter drafting (offline template — AI refines it when available) */
function offlineLetter(kind, data, lang) {
  const d = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const name = data.name || '[Your Name]';
  const addr = data.address || '[Your Address]';
  const auth = data.authority || '[Department / Office]';
  const subj = data.subject || '[Subject]';
  const det = data.details || '[Details]';
  const L = lang;

  const bodies = {
    rti: `To,
The Public Information Officer (PIO),
${auth}

Subject: Application under the Right to Information Act, 2005 — ${subj}

Respected Sir/Madam,

I, ${name}, a citizen of India residing at ${addr}, hereby apply under Section 6(1) of the Right to Information Act, 2005 for the following information. I have enclosed the prescribed fee of ₹10 (by IPO / court fee stamp / online payment).

Information sought:
${det.split('\n').map((l, i) => `${i + 1}. ${l.replace(/^\d+\.\s*/, '')}`).join('\n')}

I state that the information sought does not fall under the exemptions of Section 8 or Section 9 of the Act, and that it pertains to your public authority. As mandated by the Act, I request the information within 30 days of receipt of this application.

If any part of this application is rejected, kindly state the specific provision of the Act under which the rejection is made, along with the name and designation of the appellate authority.

Yours faithfully,
${name}
${addr}
Date: ${d}`,

    grievance: `To,
${auth}

Subject: Public grievance — ${subj}

Respected Sir/Madam,

I, ${name}, resident of ${addr}, wish to lodge the following grievance for your kind consideration and redressal.

Facts of the matter:
${det}

I request you to kindly look into this matter, take the necessary action, and inform me of the outcome in writing at the earliest. I am willing to provide any further document or appear in person for verification if required.

I hope to receive a reasoned reply within the time prescribed in the Citizen's Charter. As the grievance is being filed on the CPGRAMS portal, the reference number may be noted for follow-up.

Yours faithfully,
${name}
${addr}
Date: ${d}`,

    scheme: `To,
${auth}

Subject: Request for grant of benefit — ${subj}

Respected Sir/Madam,

I, ${name}, resident of ${addr}, wish to submit my representation for the benefit of the above-mentioned scheme. I fulfil the eligibility criteria laid down for the scheme and have enclosed the necessary documents for your verification.

Details of my request:
${det}

Documents enclosed:
1. Aadhaar card (self-attested)
2. Income certificate
3. Residence proof
4. Bank passbook (first page)
5. Supporting certificates, if any

Kindly process my application and grant the benefit. If any additional document is required, I request that I be informed in writing so that I can supply it promptly.

Yours faithfully,
${name}
${addr}
Date: ${d}`,

    cert: `To,
${auth}

Subject: Application for issuance of certificate — ${subj}

Respected Sir/Madam,

I, ${name}, resident of ${addr}, request the issuance of the above-mentioned certificate as per the provisions of the relevant Act and the state's e-District procedure.

Particulars for the application:
${det}

Enclosures:
1. Aadhaar card
2. Ration card / residence proof
3. Supporting records (school certificate / land record, as applicable)
4. Self-declaration / affidavit, if required

I declare that the information furnished above is true to the best of my knowledge and belief, and I understand that a false declaration is punishable under law. Kindly issue the certificate after due verification.

Yours faithfully,
${name}
${addr}
Date: ${d}`,
  };
  return bodies[kind] || bodies.grievance;
}

if (typeof window !== "undefined") {
  Object.assign(window, {
    rankSchemes, evaluateScheme, allDocuments, docReadiness, docGuide,
    checkFraud, classify, offlineAnswer, offlineLetter, buildEvidence, DOC_GUIDE,
  });
}
