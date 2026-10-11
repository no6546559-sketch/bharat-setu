# Bharat Setu · भारत सेतु
## Project Report — AI for Bharat & Public Services

**Submission for:** Hackathon — theme *AI for Bharat & Public Services*
**Live application:** https://webapp-kohl-six-95.vercel.app
**Source code:** https://github.com/no6546559-sketch/bharat-setu
**Team size:** solo–4 (project is designed for a small team; all roles merged in this build)
**Report date:** 11 October 2026

---

## 1. Executive Summary

India operates one of the largest social-welfare systems on earth. Yet a large share of
eligible citizens never receive the benefits they are legally entitled to. The binding
constraint is almost never money — it is **information asymmetry**: schemes are scattered
across dozens of central and state portals, most interfaces are English-first, the forms are
not explained, and a layer of middlemen profits from that confusion.

**Bharat Setu** ("India Bridge") is a **multilingual, explainable, offline-first AI assistant**
that closes that gap. A citizen enters a short profile once and receives:

- every government scheme they are eligible for, **with the exact reason** they qualify;
- a **document-readiness score** telling them precisely what is missing and where to get it;
- a **formal RTI / grievance / certificate letter** they can print and submit the same day;
- an estimated **annual benefit value in rupees**, tracked application-by-application;
- a **fraud shield** that reads a suspicious SMS and explains, in plain language, exactly
  what is happening and what to do next.

It does all of this in **13 Indian languages** (including RTL Urdu), by **voice or text**, and
**with no internet connection required** — because the entire reasoning engine runs on the
device.

---

## 2. Problem Statement

### 2.1 The gap
| Barrier | Consequence for the citizen |
|---|---|
| **Fragmented discovery** — schemes live on dozens of separate portals | Eligible people never learn they qualify |
| **Language** — most portals are English-first | Crores of citizens are locked out of the interface |
| **Opaque eligibility rules** | People don't know *why* they were rejected or what to fix |
| **Documentation chaos** | Applications stall on a single missing certificate |
| **No recourse knowledge** | Citizens don't know RTI or grievance mechanisms exist |
| **Fraud and middlemen** | Fake "benefit" SMS, processing-fee scams, touts |

### 2.2 Who suffers most
First-time internet users, rural households, women, senior citizens, persons with
disabilities, and low-literacy users — precisely the groups the welfare system is meant to
protect. Any solution must therefore be **simple, spoken, localised and trustworthy**, not
merely accurate.

---

## 3. Solution Overview

Bharat Setu is a **single installable web app** with eight tightly integrated views:

| # | View | What it does |
|---|---|---|
| 1 | 🏠 **Home** | Explains the product, one-tap entry points, key numbers |
| 2 | 🧭 **Scheme Finder** | Profile → ranked eligibility list **with reasons and blockers** |
| 3 | 📋 **My Plan** | Application tracker + document bar + **₹ benefit estimator** |
| 4 | 🤖 **AI Assistant** | Grounded Q&A in 13 languages, voice in and out |
| 5 | 📄 **Document Checker** | Readiness score, missing docs, issuing office + timeline |
| 6 | ✍️ **RTI & Letters** | RTI, grievance, scheme representation, certificate request |
| 7 | 🛡️ **Fraud Shield** | Risk score /100 + red flags + exact next actions |
| 8 | 📞 **Helplines & Help** | 12 national helplines + plain-language glossary |

### 3.1 Core innovation — explainable eligibility
Most "scheme finders" return a bare list. Bharat Setu returns a **verdict with evidence**.
For every scheme the engine emits structured reasons and blockers, e.g.:

> ✓ *Age 34 is within the eligible band 18–120*
> ✓ *Rural residence matches the scheme area*
> ✓ *Land holding 1.5 acre(s) is within limits*
> ✕ *Income limit is ₹6,00,000/year*

This is produced by a **rule engine over a machine-readable `rules{}` block** stored with each
scheme — not by an LLM. That means it is deterministic, auditable, instantaneous, and works
offline.

### 3.2 Core innovation — grounded AI with graceful degradation
The optional LLM layer is **never the source of truth**. The serverless function builds its
system prompt directly from the same curated knowledge base the UI uses and is instructed to
cite only official `.gov.in` / `.nic.in` portals. If no key is configured, the upstream is
down, or the response looks ungrounded, the handler returns `{ok:false, fallback:true}` and the
client seamlessly answers from the **deterministic offline engine**. The user therefore never
sees a fabricated scheme, amount or URL — the failure mode is *less rich*, never *wrong*.

### 3.3 Core innovation — offline-first
All eligibility, document, letter and fraud logic ships as static JavaScript and is cached by a
**service worker**. A citizen in a low-connectivity district retains full functionality. This is
the single most important design decision for the "Bharat" context.

### 3.4 Designed for the actual user
- **13 languages** — English, Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada,
  Malayalam, Punjabi, Odia, Assamese, Urdu (with full RTL layout).
- **Voice in & out** via the Web Speech API, locale-matched per language.
- **Font scaling to 140 %**, **high-contrast mode**, **dark mode**.
- **Simple Mode** — one tap enlarges text, calms the layout and hides decorative elements for
  first-time internet users.

---

## 4. System Architecture

```
                         ┌────────────────────────────────────────────┐
   Citizen (any phone)   │  STATIC APP SHELL  ·  public/             │
   ────────────────────► │  index.html · app.css · app.js             │
                         │  schemes.js  → 43 schemes (knowledge base) │
                         │  i18n.js     → 13 languages                │
                         │  engine.js   → eligibility · docs · fraud  │
                         │  sw.js       → offline cache (PWA)         │
                         └───────────────┬────────────────────────────┘
                                         │  POST /api/ai   (optional)
                                         │  graceful fallback ↓
                                         ▼
                         ┌────────────────────────────────────────────┐
   Vercel Serverless     │  api/ai.js  — grounded LLM proxy           │
   Function (Node.js)    │  api/kb.js  — auto-generated KB (43)       │
                         └───────────────┬────────────────────────────┘
                                         │  OpenAI-compatible chat API
                                         ▼
                                      LLM  (gpt-5-mini → gpt-5-nano fallback)
```

### 4.1 Deliberate architectural choice — zero build step
The application is a **plain static bundle plus one serverless function**. There is no bundler,
no front-end framework and no runtime filesystem access. Consequences:

1. The **same `api/ai.js` handler** runs under the local dev server *and* on Vercel, so local
   and production behaviour are identical.
2. A static bundle is trivially cacheable, and caching is what makes offline mode viable.
3. Tiny footprint → fast on 3G and on low-end devices, which is the target.

### 4.2 Technology stack
| Layer | Technology | Rationale |
|---|---|---|
| Front end | Semantic HTML5, hand-written CSS design system, **vanilla JS** | No framework cost; runs on any device |
| Reasoning | Custom rule engine + NLU + fraud scoring in `engine.js` | Deterministic, offline, auditable |
| Back end | **One Vercel serverless function** (`api/ai.js`) | Minimum surface, Vercel-native |
| AI | Any OpenAI-compatible chat endpoint (`AI_MODEL`, `AI_MODEL_FALLBACK`) | Provider-agnostic, swappable |
| Offline | Service Worker + Web App Manifest (PWA) | Works without network |
| Voice | Web Speech API (`SpeechRecognition`, `speechSynthesis`) | Free, on-device, 13 locales |
| Hosting | **Vercel** (static + functions) · **GitHub** (source) | One-click, free tier |

### 4.3 Repository layout
```
webapp/
├── api/
│   ├── ai.js                 # serverless AI proxy (chat | letter | fraud)
│   └── kb.js                 # auto-generated grounded knowledge base
├── public/
│   ├── index.html            # 8-view app shell
│   ├── manifest.webmanifest  # PWA manifest
│   ├── sw.js                 # offline service worker
│   └── static/
│       ├── app.css           # design system
│       ├── app.js            # UI shell, views, My Plan tracker
│       ├── schemes.js        # 43 real schemes (the knowledge base)
│       ├── i18n.js           # 13 languages
│       ├── engine.js         # offline reasoning engine
│       └── icon.svg / icon-192.png / icon-512.png
├── scripts/
│   ├── dev-server.mjs        # local + sandbox server (Vercel-parity)
│   ├── build.mjs             # build validator (no bundler needed)
│   ├── verify.mjs            # 63-test end-to-end suite
│   ├── generate-kb.mjs       # schemes.js → api/kb.js
│   ├── make-icons.mjs        # zero-dependency PNG icon generator
│   └── add-plan-i18n.mjs     # multilingual string injector
├── vercel.json               # Vercel config (build, functions, headers)
├── ecosystem.config.cjs      # PM2 config for the sandbox
└── package.json
```

---

## 5. The Knowledge Base

**43 real Government of India / State schemes**, each with a machine-readable rule block,
official portal, required documents and application steps. Coverage spans **30 categories**:

`farmer · cash · pension · worker · bpl · food · family · women · energy · rural · water ·
housing · urban · health · all · girls · savings · education · disability · senior · student ·
loan · skill · employment · business · scst · insurance · safety · rights · governance · document`

Representative schemes: **PM-Kisan**, **PM-JAY / Ayushman Bharat**, **PM Awas Yojana
(Gramin & Urban)**, **MGNREGA**, **NFSA**, **NSAP pensions**, **Sukanya Samriddhi**, **Atal
Pension Yojana**, **Mudra**, **PM SVANidhi**, **Ujjwala**, **Jal Jeevan Mission**, **RTE**,
**PM Vishwakarma**, **e-Shram**, **UDID**, **DigiLocker**, **Passport Seva**, **Ni-kshay (TB)**,
and **RTI**.

The knowledge base also powers a **catalogue of 83 distinct documents**, each with a guide
stating *who issues it* and *how long it takes*, plus **12 national helplines**.

---

## 6. Feature Detail and Walkthrough

### 6.1 Scheme Finder — explainable matching
The engine evaluates hard identity conditions (women-only, widow, disability, TB, girl-child,
farmer, employed …) as blockers, then scores soft/quantitative conditions (age band, income
ceiling, land holding, rural/urban, category interest). Verdicts: `high` / `mid` / `low` /
`none`. Every surviving match carries human-readable reasons; every blocked scheme shows why.

### 6.2 My Plan — from discovery to disbursement  **(new)**
Discovery is only the first mile. My Plan turns a match list into an actionable plan:
- **Application tracker** — mark each scheme *Not started → Applied → Benefit received →
  Rejected (escalate)*, with an optional reference-number note.
- **Document-readiness bar** per scheme, driven by the Document Checker state.
- **Estimated annual benefit value in ₹**, computed conservatively by parsing each matched
  scheme's headline amount (monthly amounts annualised). Presented as an itemised table with a
  total — a tangible, motivating number.
- **Export** the whole plan as a `.txt`, **share** it via the Web Share API, or **print** it to
  PDF to carry to a CSC, bank or Gram Panchayat office.

### 6.3 AI Assistant — grounded, multilingual
Text or voice in any of 13 languages. The classifier detects intent (eligibility, documents,
how-to, status, amount, grievance, RTI, fraud, health, education, employment, pension,
agriculture, housing, women, water, help), extracts entities (age, income, land) and selects
evidence schemes. The LLM layer refines the answer; the offline engine guarantees one always
exists.

### 6.4 Document Checker
Tick what you already have → a readiness percentage, the exact missing documents, and for each
one the **issuing office** and **expected timeline** (e.g. *Income certificate — apply on the
state e-District portal or CSC; the Tehsildar/Revenue office issues it; 7–15 days*).

### 6.5 RTI & Letters
Four legally-shaped templates — **RTI application** (cites Section 6(1), the ₹10 fee, the
30-day statutory deadline and the appellate authority), **public grievance**, **scheme
representation**, and **certificate request**. Each is refined by the AI when available and
always available offline. Print, copy or download.

### 6.6 Fraud Shield
A transparent, weighted rule set scores a pasted SMS/WhatsApp message out of 100: OTP/PIN
requests, artificial urgency, shortened/throwaway domains, up-front "processing fees",
lottery claims, APK/screen-share pushes, bank-detail harvesting, brand impersonation, job
scams, fake free-scheme offers, and generic mass-mailing language. Genuine `.gov.in`/`.nic.in`
domains register as a *positive* signal (with a negative lookahead so a phishing lookalike such
as `pmkisan.gov.in.xyz` cannot masquerade as safe). Output: verdict, the red flags explained,
and concrete next steps (call **1930** within the golden hour, report on cybercrime.gov.in,
block the card, report to Sanchar Saathi).

### 6.7 Accessibility and inclusion
Skip link, ARIA live regions, keyboard-operable controls, semantic landmarks, 13 languages with
correct `dir="rtl"` for Urdu, font scaling to 140 %, high-contrast and dark themes, optional
spoken output for every answer, and a dedicated **Simple Mode** for first-time users.

---

## 7. Deployment and Verification

### 7.1 Live deployment
| Item | Value |
|---|---|
| **Production URL** | https://webapp-kohl-six-95.vercel.app |
| **Platform** | Vercel (static output `public/` + one serverless function) |
| **Source** | https://github.com/no6546559-sketch/bharat-setu (branch `main`) |
| **Status** | ✅ Live, HTTP 200, public |

### 7.2 API surface
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/ai` | Status: `{ ok, ai_enabled, model, schemes, modes }` |
| `POST` | `/api/ai` | `mode:"chat"` grounded Q&A · `mode:"letter"` letter drafting · `mode:"fraud"` second-opinion fraud analysis |

### 7.3 Automated verification
`node scripts/verify.mjs` executes **63 assertions against the shipped bytes** (not a
re-implementation), covering:

- **Eligibility engine** — ranking, farmer/BPL/women paths, hard exclusions, age boundaries,
  and income ceilings (including the corrected ESIC ₹3,00,000 limit case).
- **Document intelligence** — catalogue build, readiness scoring, per-document guides.
- **Fraud shield** — scam detection, official-domain positive signal.
- **Multilingual NLU** — intent classification and entity extraction (age/income/land).
- **Grounded offline answers** — citations, RTI routing, fraud routing.
- **Letter generator** — all four letter types.
- **i18n completeness** — all 13 languages.
- **Live `/api/ai` endpoint** — status and graceful fallback.

**Result: 63 passed, 0 failed.** The build validator additionally confirms every scheme carries
an official portal link, all scheme IDs are unique, and both serverless modules are present.

### 7.4 Graceful degradation verified in production
On the live deployment the API currently reports `ai_enabled:false` (no LLM key configured in
the Vercel project) and `POST /api/ai` returns `{ok:false, fallback:true}`. The client
transparently serves the deterministic offline engine — **every feature remains fully
functional**. This is the intended failure mode and is validated by the test suite.

---

## 8. Mapping to Evaluation Criteria

| Criterion | How Bharat Setu satisfies it |
|---|---|
| **Innovation & Originality** | Explainable rule-based eligibility (verdict *with evidence*) + grounded AI that degrades to a deterministic engine; ₹ benefit estimator; document-intelligence with issuing office and timelines; Fraud Shield that explains *why* |
| **Technical Implementation** | 43-scheme machine-readable KB, custom NLU, 13-language i18n, PWA offline, service worker, serverless AI proxy with rate limiting and model fallback, 63-test suite, build validator, zero-dependency icon generator |
| **Real-World Impact** | Directly addresses the last-mile information gap in India's welfare delivery; targets the exact groups most excluded (rural, women, seniors, disabled, first-time users) |
| **Usability** | 13 languages incl. RTL, voice in/out, font scaling to 140 %, high contrast, dark mode, Simple Mode, plain-language glossary, one-tap demo profile |
| **Scalability** | Fully static front end on a global CDN; stateless serverless function; KB is a data file — adding schemes/languages is additive; no database to scale |
| **Presentation & Demo** | Live URL + GitHub + this report + a 14-slide deck; demo path: sample profile → ranked schemes → My Plan ₹ estimate → document readiness → RTI letter → fraud check |

---

## 9. Limitations and Responsible Use

- Benefit amounts and eligibility criteria are **indicative** and change by government
  notification. Every scheme card links the official portal and the app instructs the user to
  confirm before applying.
- This is **not a government website**. It does not accept applications, hold funds, or
  represent any department.
- **Privacy:** all profile data, tracker state and chat history live only in the browser's
  `localStorage`. Nothing is uploaded. Only free-text the user explicitly submits (question,
  letter details, suspicious message) is forwarded to the LLM — and only while online.
- The app never requests, and should never be given, OTPs, PINs, CVVs or full bank/Aadhaar
  numbers.

---

## 10. Future Roadmap

1. **More schemes and state-specific top-ups** (currently pan-India plus popular state schemes).
2. **DigiLocker integration** to auto-verify documents and pre-fill the checklist.
3. **SMS/IVR channel** for feature phones, extending reach beyond smartphones.
4. **On-device OCR** to read a photograph of a government notice.
5. **Status polling** via official portals where an API exists, to auto-update My Plan.
6. **Offline-first localisation** of scheme *descriptions* (currently hero text + scheme names/
   benefits are localised, with AI handling long-form explanation).

---

## 11. Conclusion

Bharat Setu demonstrates that the hardest problem in Indian welfare delivery is not
eligibility — it is **access**. By combining an **explainable, offline, multilingual reasoning
engine** with a **grounded AI layer that can only ever add richness, never risk correctness**,
the project delivers a tool that a first-time internet user in a low-connectivity district can
genuinely use to find, claim and track the benefits they are owed.

It is live, open-source, fully tested, and built to run where it is needed most — at the edge,
on a phone, in the citizen's own language.

---

*Built as an independent citizen-help tool for a hackathon.*
**Helplines:** 🚨 112 emergency · 👩 181 women · 💳 1930 cyber fraud · 🧒 1098 child
