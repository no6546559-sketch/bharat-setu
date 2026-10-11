# Bharat Setu · भारत सेतु

**An AI bridge between Indian citizens and the public services they are entitled to.**

> Hackathon theme: **AI for Bharat & Public Services**
> Live: _see the Deploy section for the current production URL_

India runs one of the largest welfare systems on earth, yet crores of eligible citizens never receive their benefit. The barrier is rarely money — it is **information**: dozens of portals, English-only interfaces, unexplained forms, and middlemen who profit from that confusion. **Bharat Setu** puts a multilingual, explainable, offline-capable assistant in the citizen's pocket.

---

## 1. What it does

| Feature | What the citizen gets |
|---|---|
| 🧭 **Scheme Finder** | Fills one profile → gets every scheme they qualify for, **with the exact reason** they qualify (and what blocks them). |
| 📋 **My Plan** | A tracker for each matched scheme (Not started → Applied → Received / Rejected), a **document-readiness bar**, and an **estimated annual benefit value** in ₹. Export / share / print as a PDF-ready plan. |
| 🤖 **AI Assistant** | Asks anything in **13 Indian languages** (by text or voice). Answers are grounded on a curated knowledge base — never invented. Falls back to a fully offline answer engine. |
| 📄 **Document Checker** | Pick what you already have → readiness score, the missing documents, **who issues each one and how long it takes**. |
| ✍️ **RTI & Letters** | Generates a formal **RTI application**, **public grievance**, **scheme representation** or **certificate request** — print, copy or download. |
| 🛡️ **Fraud Shield** | Paste any suspicious SMS / WhatsApp message → risk score out of 100, red flags explained, and the exact next steps (call 1930, report on cybercrime.gov.in). |
| 📞 **Helplines & Help** | 112 / 181 / 1930 / 1098 and more, plus a plain-language glossary of government terms. |
| ♿ **Accessibility** | 13 languages incl. RTL Urdu, voice in & out, font scaling to 140%, high-contrast mode, dark mode, and a **Simple Mode** for first-time internet users. |
| 📴 **Offline (PWA)** | Installs as a PWA. Eligibility, documents, letters and fraud rules all run **on-device** — no internet required. |

---

## 2. Why it is different

1. **Explainable, not a black box.** Every eligibility verdict shows the rule that matched (`Age 34 is within the eligible band 18–120`) and every blocker (`This scheme operates in rural areas`).
2. **Grounded AI, zero hallucination by design.** The LLM receives a system prompt built from the same 43-scheme knowledge base the UI uses, and is instructed to cite only official `.gov.in` / `.nic.in` portals. If the LLM is unavailable, the app degrades to a deterministic offline engine — never to a wrong answer.
3. **Works at the edge of the network.** All reasoning ships as static JavaScript and is cached by a service worker. A citizen in a low-connectivity district still gets full functionality.
4. **Designed for the actual user.** Large text, plain language, voice, and a Simple Mode — because the target user is often a first-time internet user.

---

## 3. Architecture

```
                      ┌──────────────────────────────────────────┐
   Browser (any device)│  static shell  (public/)                 │
   ─────────────────► │  index.html · app.css · app.js            │
                      │  schemes.js (43 schemes) · i18n.js (13)   │
                      │  engine.js  ← eligibility · docs · fraud  │
                      │  sw.js      ← offline cache (PWA)         │
                      └───────────────┬──────────────────────────┘
                                      │ POST /api/ai  (optional, graceful)
                                      ▼
                      ┌──────────────────────────────────────────┐
   Vercel Serverless  │  api/ai.js   — grounded LLM proxy         │
   Function (Node)    │  api/kb.js   — auto-generated KB (43)      │
                      └───────────────┬──────────────────────────┘
                                      │ OpenAI-compatible chat API
                                      ▼
                                   LLM (gpt-5-mini → gpt-5-nano fallback)
```

**Design choice:** a **zero-build static bundle + one serverless function**. There is no bundler, no framework, and no runtime filesystem. The same `api/ai.js` handler runs under the sandbox dev server *and* on Vercel, so local and production behaviour are identical.

### Technology
- **Frontend:** semantic HTML5, hand-written CSS (design system with CSS variables), **vanilla JavaScript** — no framework, no build step.
- **Backend:** one Vercel serverless function (`api/ai.js`), Node.js runtime.
- **AI:** any OpenAI-compatible chat endpoint. Model configurable via `AI_MODEL` / `AI_MODEL_FALLBACK`.
- **Offline:** Service Worker + Web App Manifest (PWA).
- **Voice:** Web Speech API (`SpeechRecognition` + `speechSynthesis`).
- **Hosting:** Vercel (static + functions). Source on GitHub.

---

## 4. Repository layout

```
webapp/
├── api/
│   ├── ai.js                 # serverless AI proxy (chat | letter | fraud)
│   └── kb.js                 # auto-generated grounded knowledge base
├── public/
│   ├── index.html            # 9-view app shell
│   ├── manifest.webmanifest  # PWA manifest
│   ├── sw.js                 # offline service worker
│   └── static/
│       ├── app.css           # design system
│       ├── app.js            # UI shell, views, My Plan tracker
│       ├── schemes.js        # 43 real schemes (the knowledge base)
│       ├── i18n.js           # 13 languages
│       ├── engine.js         # offline reasoning engine
│       ├── icon.svg / icon-192.png / icon-512.png
├── scripts/
│   ├── dev-server.mjs        # local + sandbox server (Vercel-parity)
│   ├── build.mjs             # build validator (no bundler needed)
│   ├── verify.mjs            # 63-test end-to-end suite
│   ├── generate-kb.mjs       # schemes.js → api/kb.js
│   ├── make-icons.mjs        # zero-dependency PNG icon generator
│   └── add-plan-i18n.mjs     # one-off multilingual string injector
├── vercel.json               # Vercel config (build, functions, headers)
├── ecosystem.config.cjs      # PM2 config for the sandbox
└── package.json
```

---

## 5. Functional entry points

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/` | The application shell (single page, hash-routed views). |
| `GET` | `/api/ai` | Health/status: `{ ok, ai_enabled, model, schemes }`. |
| `POST` | `/api/ai` | `mode: "chat"` — grounded question answering. |
| `POST` | `/api/ai` | `mode: "letter"` — refine an RTI / grievance / certificate letter. |
| `POST` | `/api/ai` | `mode: "fraud"` — second-opinion fraud analysis on a message. |

**Client-side views** (via `location.hash`): `#home` `#finder` `#plan` `#assistant` `#docs` `#letters` `#fraud` `#help`.

### Data models

- **Profile** (local, never uploaded): `{ age, gender, area, state, income, category, landAcres, occupation, childAge, flags{}, interests[] }`
- **Scheme**: `{ id, name, name_hi, cats[], tag, benefit, benefit_hi, desc, docs[], how[], apply_url, rules{} }`
- **Match result**: `{ scheme, verdict: high|mid|low|none, reasons[], blockers[], score }`
- **Tracker entry**: `schemeId → { status: todo|applied|received|rejected, note }`

**Storage:** 100% client-side (`localStorage`). No personal data is ever sent to a server; only the free-text question/letter/message is forwarded to the LLM, and only when the user is online.

---

## 6. The knowledge base

**43 real Government of India / State schemes** across cash support, food, health, housing, education, employment, social security, financial inclusion, digital identity and citizen rights — including PM-Kisan, PM-JAY (Ayushman Bharat), PM Awas Yojana (G & U), MGNREGA, NFSA, NSAP pensions, Sukanya Samriddhi, Atal Pension, Mudra, PM SVANidhi, Ujjwala, Jal Jeevan Mission, RTE, PM Vishwakarma, e-Shram, UDID, DigiLocker, Passport Seva, Ni-kshay (TB), and RTI.

Every entry carries its official `.gov.in` portal, the documents needed, and a machine-readable `rules{}` block that the eligibility engine evaluates.

---

## 7. Running locally

```bash
# no dependencies to install — it is plain Node
npm start                 # http://localhost:3000  (static + /api/ai)

npm run build             # validate the bundle
npm run verify            # 63-test suite (server must be running)
npm run kb                # regenerate api/kb.js from schemes.js
```

Optional AI credentials (create `.env` — **never commit it**):

```env
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://your-openai-compatible-endpoint/v1
AI_MODEL=gpt-5-mini
AI_MODEL_FALLBACK=gpt-5-nano
```

Without a key the app still works fully — every feature has a deterministic offline path.

---

## 8. Deploy

**Vercel** (static output `public/`, one function `api/ai.js`):

```bash
npx vercel build
npx vercel deploy --prebuilt --prod
```

**GitHub:** the repository is pushed on branch `main` — see the GitHub link above.

---

## 9. Testing

`npm run verify` runs **63 assertions** against the *shipped bytes* (not a re-implementation):

- eligibility engine — ranking, farmer/BPL/women paths, hard exclusions, age boundaries, income ceilings
- document intelligence — catalogue, readiness scoring, per-document guides
- fraud shield — scam detection, official-domain positive signal
- multilingual NLU — intent classification and entity extraction (age / income / land)
- grounded offline answers — citations, RTI, fraud routing
- letter generator — all four letter types
- i18n completeness — all 13 languages
- the live `/api/ai` endpoint

---

## 10. Limitations & responsible use

- Benefit amounts and eligibility criteria are **indicative** and change by notification. The app always links the official portal and reminds the user to confirm.
- This is **not a government website**. It does not accept applications, hold funds, or represent any department.
- The app never asks for — and should never be given — OTPs, PINs, CVVs, or full bank/Aadhaar numbers.
- Always verify scheme details on the official website before applying.

---

## 11. Roadmap

- [ ] More schemes + state-specific top-ups (currently pan-India + popular state schemes)
- [ ] DigiLocker integration to auto-fill the document checklist
- [ ] SMS/IVR channel for feature phones
- [ ] Offline OCR to read a photo of a government notice
- [ ] Status polling via official portal links where an API exists

---

## 12. License

MIT. Built as an independent citizen-help tool for a hackathon.

**Helplines:** 🚨 112 emergency · 👩 181 women · 💳 1930 cyber fraud · 🧒 1098 child
