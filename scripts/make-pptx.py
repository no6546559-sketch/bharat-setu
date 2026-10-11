#!/usr/bin/env python3
"""Bharat Setu — hackathon pitch deck generator (14 slides, 16:9).
Produces deliverables/Bharat_Setu_Pitch_Deck.pptx with a tricolour palette."""
import os
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

SAFFRON = RGBColor(0xFF, 0x99, 0x33)
GREEN   = RGBColor(0x13, 0x88, 0x08)
NAVY    = RGBColor(0x0B, 0x3D, 0x91)
INK     = RGBColor(0x14, 0x1B, 0x2E)
MUTED   = RGBColor(0x5A, 0x64, 0x7A)
PANEL   = RGBColor(0xF4, 0xF6, 0xFB)
WHITE   = RGBColor(0xFF, 0xFF, 0xFF)
LINE    = RGBColor(0xD8, 0xDE, 0xEC)
RED     = RGBColor(0xC0, 0x2B, 0x2B)

W, H = Inches(13.333), Inches(7.5)

prs = Presentation()
prs.slide_width, prs.slide_height = W, H
BLANK = prs.slide_layouts[6]


def add(slide, kind, l, t, w, h, **kw):
    return slide.shapes.add_shape(kind, l, t, w, h, **kw)


def box(slide, l, t, w, h, fill=None, line=None, lw=1.0, rounded=False, radius=0.08):
    sh = add(slide, MSO_SHAPE.ROUNDED_RECTANGLE if rounded else MSO_SHAPE.RECTANGLE, l, t, w, h)
    if rounded:
        try: sh.adjustments[0] = radius
        except Exception: pass
    if fill is None:
        sh.fill.background()
    else:
        sh.fill.solid(); sh.fill.fore_color.rgb = fill
    if line is None:
        sh.line.fill.background()
    else:
        sh.line.color.rgb = line; sh.line.width = Pt(lw)
    sh.shadow.inherit = False
    return sh


def text(slide, l, t, w, h, runs, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, wrap=True):
    """runs: list of (string, size, bold, color, space_before, bullet) or a plain string."""
    tb = slide.shapes.add_textbox(l, t, w, h)
    tf = tb.text_frame
    tf.word_wrap = wrap
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = Inches(0.04)
    tf.margin_top = tf.margin_bottom = 0
    if isinstance(runs, str):
        runs = [(runs, 18, False, INK, 0, False)]
    first = True
    for item in runs:
        s, size, bold, color, sb, bullet = (list(item) + [0, False])[:6]
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        p.alignment = align
        if sb: p.space_before = Pt(sb)
        p.line_spacing = 1.12
        r = p.add_run()
        r.text = ("•  " + s) if bullet else s
        r.font.size = Pt(size); r.font.bold = bold; r.font.color.rgb = color
        r.font.name = "Calibri"
    return tb


def header(slide, kicker, title, n):
    box(slide, 0, 0, W, Inches(0.09), fill=SAFFRON)
    box(slide, 0, Inches(0.09), W, Inches(0.02), fill=GREEN)
    text(slide, Inches(0.6), Inches(0.34), Inches(11.4), Inches(0.3),
         [(kicker.upper(), 11.5, True, SAFFRON, 0, False)])
    text(slide, Inches(0.6), Inches(0.62), Inches(11.8), Inches(0.7),
         [(title, 29, True, NAVY, 0, False)])
    text(slide, Inches(12.35), Inches(6.95), Inches(0.5), Inches(0.3),
         [(str(n), 10, True, MUTED, 0, False)], align=PP_ALIGN.RIGHT)


def notes(slide, s):
    slide.notes_slide.notes_text_frame.text = s


def footer(slide, label="Bharat Setu · भारत सेतु"):
    text(slide, Inches(0.6), Inches(6.95), Inches(6), Inches(0.3),
         [(label, 9.5, False, MUTED, 0, False)])


def chip(slide, l, t, w, h, label, fill=PANEL, color=NAVY, size=11.5, bold=True):
    box(slide, l, t, w, h, fill=fill, rounded=True, radius=0.35)
    text(slide, l, t + Inches(0.06), w, h, [(label, size, bold, color, 0, False)],
         align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)


def card(slide, l, t, w, h, title, lines, accent=NAVY, tsize=15, bsize=12.5):
    box(slide, l, t, w, h, fill=WHITE, line=LINE, rounded=True, radius=0.07)
    box(slide, l, t, Inches(0.07), h, fill=accent)
    text(slide, l + Inches(0.24), t + Inches(0.16), w - Inches(0.45), Inches(0.4),
         [(title, tsize, True, NAVY, 0, False)])
    body = [(x, bsize, False, INK, 0, True) for x in lines]
    text(slide, l + Inches(0.24), t + Inches(0.62), w - Inches(0.45), h - Inches(0.8), body)


S = lambda: prs.slides.add_slide(BLANK)

# ───────────────────────── 1. TITLE ─────────────────────────
s = S()
box(s, 0, 0, W, H, fill=WHITE)
box(s, 0, 0, Inches(0.22), H, fill=SAFFRON)
box(s, Inches(0.22), 0, Inches(0.08), H, fill=WHITE)
box(s, Inches(0.30), 0, Inches(0.08), H, fill=GREEN)
box(s, 0, Inches(6.6), W, Inches(0.9), fill=NAVY)
text(s, Inches(1.0), Inches(1.15), Inches(11), Inches(0.5),
     [("AI FOR BHARAT & PUBLIC SERVICES", 13, True, SAFFRON, 0, False)])
text(s, Inches(1.0), Inches(1.62), Inches(11.3), Inches(1.5),
     [("Bharat Setu", 54, True, NAVY, 0, False),
      ("भारत सेतु  —  an AI bridge between citizens and their government", 21, False, MUTED, 8, False)])
text(s, Inches(1.0), Inches(3.25), Inches(10.8), Inches(1.0),
     [("One profile → every scheme you are eligible for, with the exact reason, in 13 Indian languages,",
       16.5, False, INK, 0, False),
      ("by voice or text, and fully offline.", 16.5, False, INK, 2, False)])
for i, (t_, c) in enumerate([("43 schemes", NAVY), ("13 languages", GREEN),
                             ("83 documents", SAFFRON), ("12 helplines", NAVY),
                             ("63/63 tests", GREEN), ("₹0 to citizen", SAFFRON)]):
    chip(s, Inches(1.0) + Inches(1.95) * i, Inches(4.35), Inches(1.78), Inches(0.5), t_, fill=PANEL, color=c)
text(s, Inches(1.0), Inches(5.25), Inches(11), Inches(0.8),
     [("Live:  https://webapp-kohl-six-95.vercel.app", 14, True, NAVY, 0, False),
      ("Source:  https://github.com/no6546559-sketch/bharat-setu", 14, False, MUTED, 4, False)])
text(s, Inches(1.0), Inches(6.75), Inches(11), Inches(0.4),
     [("112 emergency  ·  181 women  ·  1930 cyber fraud  ·  1098 child", 12, True, WHITE, 0, False)])
notes(s, "Bharat Setu means 'India Bridge'. It is a multilingual, offline-first assistant that helps an Indian citizen discover, claim and track every government benefit they are entitled to. It is live on Vercel and fully open source.")

# ───────────────────────── 2. PROBLEM ─────────────────────────
s = S()
header(s, "The problem", "Eligible citizens never receive their benefit", 2)
text(s, Inches(0.6), Inches(1.45), Inches(12.1), Inches(0.5),
     [("India runs one of the largest welfare systems on earth. The barrier is rarely money — it is information.", 15.5, False, MUTED, 0, False)])
items = [("🔍  Fragmented discovery", "Schemes are scattered across dozens of central and state portals."),
         ("🗣️  Language lock-out", "Most portals are English-first; crores are excluded at the interface."),
         ("❓  Opaque rules", "People don't know WHY they were rejected or what to fix."),
         ("📄  Documentation chaos", "An application stalls on one missing certificate."),
         ("⚖️  No recourse knowledge", "Citizens don't know RTI or grievance mechanisms exist."),
         ("🕵️  Fraud & middlemen", "Fake benefit SMS, processing-fee scams, touts.")]
for i, (t_, d) in enumerate(items):
    col, row = i % 2, i // 2
    l = Inches(0.6) + Inches(6.15) * col
    t = Inches(2.05) + Inches(1.28) * row
    box(s, l, t, Inches(5.85), Inches(1.1), fill=PANEL, rounded=True, radius=0.12)
    box(s, l, t, Inches(0.06), Inches(1.1), fill=RED)
    text(s, l + Inches(0.22), t + Inches(0.12), Inches(5.5), Inches(0.35), [(t_, 14.5, True, NAVY, 0, False)])
    text(s, l + Inches(0.22), t + Inches(0.5), Inches(5.5), Inches(0.5), [(d, 12, False, MUTED, 0, False)])
footer(s)
notes(s, "The binding constraint is not budget — it is information asymmetry. Six distinct barriers stack on top of each other, and the people most affected are exactly those the system is meant to protect.")

# ───────────────────────── 3. WHO SUFFERS ─────────────────────────
s = S()
header(s, "Who suffers most", "The groups the system is meant to protect", 3)
text(s, Inches(0.6), Inches(1.42), Inches(12.1), Inches(0.5),
     [("Any solution must therefore be simple, spoken, localised and trustworthy — not merely accurate.", 15.5, False, MUTED, 0, False)])
who = [("🧓", "First-time\ninternet users"), ("🌾", "Rural\nhouseholds"), ("👩", "Women"),
       ("👴", "Senior\ncitizens"), ("♿", "Persons with\ndisabilities"), ("📖", "Low-literacy\nusers")]
for i, (ic, lbl) in enumerate(who):
    l = Inches(0.6) + Inches(2.04) * i
    box(s, l, Inches(2.15), Inches(1.88), Inches(2.15), fill=WHITE, line=LINE, rounded=True, radius=0.1)
    text(s, l, Inches(2.4), Inches(1.88), Inches(0.9), [(ic, 34, False, INK, 0, False)], align=PP_ALIGN.CENTER)
    text(s, l + Inches(0.1), Inches(3.35), Inches(1.68), Inches(0.9),
         [(lbl, 12.5, True, NAVY, 0, False)], align=PP_ALIGN.CENTER)
box(s, Inches(0.6), Inches(4.65), Inches(12.13), Inches(1.75), fill=PANEL, rounded=True, radius=0.08)
text(s, Inches(0.9), Inches(4.85), Inches(11.6), Inches(1.4),
     [("The design constraint this creates", 15, True, NAVY, 0, False),
      ("Every feature must survive three conditions at once:", 12.5, False, INK, 6, False),
      ("① a low-end phone  ② an intermittent network  ③ a user who has never filled an online form", 13.5, True, GREEN, 6, False),
      ("That is why Bharat Setu is offline-first, voice-enabled, and gives every answer a plain-language reason.", 12.5, False, MUTED, 6, False)])
footer(s)
notes(s, "This slide justifies the engineering choices. If we had designed for a metropolitan English-speaking smartphone user, we would have built the wrong product.")

# ───────────────────────── 4. SOLUTION ─────────────────────────
s = S()
header(s, "The solution", "Eight views, one installable app", 4)
views = [("🏠", "Home", "One-tap entry points and key numbers"),
         ("🧭", "Scheme Finder", "Ranked matches WITH the exact reason"),
         ("📋", "My Plan", "Tracker + readiness + ₹ benefit estimate"),
         ("🤖", "AI Assistant", "Grounded Q&A, 13 languages, voice"),
         ("📄", "Document Checker", "Readiness score, issuing office, timeline"),
         ("✍️", "RTI & Letters", "RTI, grievance, scheme, certificate"),
         ("🛡️", "Fraud Shield", "Risk /100, red flags, next actions"),
         ("📞", "Helplines & Help", "12 helplines + plain-language glossary")]
for i, (ic, t_, d) in enumerate(views):
    col, row = i % 2, i // 2
    l = Inches(0.6) + Inches(6.15) * col
    t = Inches(1.95) + Inches(1.15) * row
    box(s, l, t, Inches(5.85), Inches(0.98), fill=WHITE, line=LINE, rounded=True, radius=0.1)
    box(s, l, t, Inches(0.06), Inches(0.98), fill=GREEN if col else SAFFRON)
    text(s, l + Inches(0.2), t + Inches(0.16), Inches(0.6), Inches(0.6), [(ic, 20, False, INK, 0, False)])
    text(s, l + Inches(0.82), t + Inches(0.14), Inches(4.9), Inches(0.4), [(t_, 15, True, NAVY, 0, False)])
    text(s, l + Inches(0.82), t + Inches(0.52), Inches(4.9), Inches(0.4), [(d, 11.5, False, MUTED, 0, False)])
footer(s)
notes(s, "The eight views map to the citizen's real journey: discover, plan, understand, ask, prepare, escalate, protect, and find help. Everything is in one installable app — no app store, no signup, no data upload.")

# ───────────────────────── 5. INNOVATION 1 ─────────────────────────
s = S()
header(s, "Innovation 1", "Explainable eligibility — a verdict WITH evidence", 5)
text(s, Inches(0.6), Inches(1.42), Inches(12.1), Inches(0.5),
     [("Most scheme finders return a bare list. Bharat Setu returns the reason, produced by a deterministic rule engine — not an LLM.", 15, False, MUTED, 0, False)])
box(s, Inches(0.6), Inches(2.05), Inches(7.2), Inches(4.3), fill=PANEL, rounded=True, radius=0.06)
text(s, Inches(0.9), Inches(2.25), Inches(6.6), Inches(0.4),
     [("PM Kisan Samman Nidhi  —  verdict: STRONG MATCH", 14, True, NAVY, 0, False)])
for i, (ok, txt) in enumerate([(True, "Age 34 is within the eligible band 18–120"),
                               (True, "Rural residence matches the scheme area"),
                               (True, "Land holding 1.5 acre(s) is within limits"),
                               (False, "Income limit is ₹6,00,000/year")]):
    y = Inches(2.8) + Inches(0.62) * i
    box(s, Inches(0.9), y, Inches(6.6), Inches(0.52), fill=WHITE, line=LINE, rounded=True, radius=0.2)
    text(s, Inches(1.05), y + Inches(0.11), Inches(6.3), Inches(0.4),
         [(("✓  " if ok else "✕  ") + txt, 13, True, GREEN if ok else RED, 0, False)])
card(s, Inches(8.05), Inches(2.05), Inches(4.68), Inches(2.05), "Why this matters",
     ["Auditable — the rule that fired is shown",
      "Instant — no network round-trip",
      "Works offline — pure on-device JS",
      "Never hallucinated — no LLM involved"], accent=GREEN)
card(s, Inches(8.05), Inches(4.3), Inches(4.68), Inches(2.05), "How it works",
     ["Each scheme carries a rules{} block",
      "Hard identity checks → blockers",
      "Soft checks (age, income, land) → score",
      "Verdict: high / mid / low / none"], accent=SAFFRON)
footer(s)
notes(s, "This is the heart of the product. Because the reasoning is a rule engine over structured data, it is deterministic, auditable and instant — and it keeps working with no network. The citizen learns not just what they qualify for, but why.")

# ───────────────────────── 6. INNOVATION 2 ─────────────────────────
s = S()
header(s, "Innovation 2", "Grounded AI that can only add richness — never risk correctness", 6)
text(s, Inches(0.6), Inches(1.42), Inches(12.1), Inches(0.5),
     [("The LLM is never the source of truth. Its prompt is built from the same knowledge base the UI uses.", 15, False, MUTED, 0, False)])
steps = [("1", "System prompt built\nfrom the curated KB", NAVY),
         ("2", "Instructed to cite only\nofficial .gov.in / .nic.in", SAFFRON),
         ("3", "If ungrounded, down, or\nno key → fallback:true", GREEN),
         ("4", "Client answers from the\ndeterministic offline engine", NAVY)]
for i, (n, d, c) in enumerate(steps):
    l = Inches(0.6) + Inches(3.11) * i
    box(s, l, Inches(2.15), Inches(2.86), Inches(1.85), fill=WHITE, line=LINE, rounded=True, radius=0.1)
    box(s, l, Inches(2.15), Inches(2.86), Inches(0.1), fill=c)
    text(s, l, Inches(2.4), Inches(2.86), Inches(0.6), [(n, 30, True, c, 0, False)], align=PP_ALIGN.CENTER)
    text(s, l + Inches(0.2), Inches(3.1), Inches(2.46), Inches(0.8),
         [(d, 12.5, True, INK, 0, False)], align=PP_ALIGN.CENTER)
    if i < 3:
        text(s, l + Inches(2.86), Inches(2.9), Inches(0.25), Inches(0.4), [("›", 22, True, MUTED, 0, False)], align=PP_ALIGN.CENTER)
box(s, Inches(0.6), Inches(4.25), Inches(12.13), Inches(2.05), fill=PANEL, rounded=True, radius=0.07)
text(s, Inches(0.95), Inches(4.45), Inches(11.5), Inches(1.7),
     [("The failure mode is “less rich”, never “wrong”", 17, True, NAVY, 0, False),
      ("A citizen can never be shown a fabricated scheme, a wrong amount, or a fake URL.", 13.5, False, INK, 8, False),
      ("Verified in production: the live API currently returns  { ok:false, fallback:true }  — and every feature still works.", 13, True, GREEN, 8, False),
      ("Provider-agnostic: any OpenAI-compatible endpoint, model configurable via AI_MODEL / AI_MODEL_FALLBACK.", 12.5, False, MUTED, 8, False)])
footer(s)
notes(s, "This is how we get AI benefits without AI risk in a government-services context. If the model is unavailable or behaves badly, the app degrades to a deterministic engine rather than inventing an answer. We verified this on the live deployment.")

# ───────────────────────── 7. INNOVATION 3 ─────────────────────────
s = S()
header(s, "Innovation 3", "Offline-first — designed for the network we actually have", 7)
text(s, Inches(0.6), Inches(1.42), Inches(12.1), Inches(0.5),
     [("All eligibility, document, letter and fraud logic ships as static JavaScript and is cached by a service worker.", 15, False, MUTED, 0, False)])
card(s, Inches(0.6), Inches(2.1), Inches(3.94), Inches(2.1), "📴 Runs with no network",
     ["Eligibility engine on-device", "Document guides on-device", "Letter templates on-device", "Fraud rules on-device"], accent=GREEN)
card(s, Inches(4.7), Inches(2.1), Inches(3.94), Inches(2.1), "⚡ Fast on a low-end phone",
     ["No framework, no bundler", "Semantic HTML + vanilla JS", "~330 KB total static payload", "Installs as a PWA"], accent=SAFFRON)
card(s, Inches(8.8), Inches(2.1), Inches(3.94), Inches(2.1), "🎙️ Speaks the citizen's language",
     ["13 languages incl. RTL Urdu", "Voice in and out (Web Speech)", "Font scaling to 140%", "High-contrast + Simple Mode"], accent=NAVY)
box(s, Inches(0.6), Inches(4.45), Inches(12.13), Inches(1.85), fill=NAVY, rounded=True, radius=0.07)
text(s, Inches(0.95), Inches(4.7), Inches(11.5), Inches(1.4),
     [("Why this is the single most important decision", 17, True, WHITE, 0, False),
      ("The citizens who need welfare most are the ones with the worst connectivity.", 13.5, False, RGBColor(0xE6,0xEC,0xFA), 8, False),
      ("A tool that needs a good network to work is a tool that fails exactly where it is needed.", 13.5, False, RGBColor(0xE6,0xEC,0xFA), 6, False)])
footer(s)
notes(s, "We deliberately gave up the conveniences of a framework and a build step so that the entire product could run offline on a cheap phone. This is what makes the product credible for the Bharat context.")

# ───────────────────────── 8. DEMO ─────────────────────────
s = S()
header(s, "Live demo", "The 60-second walkthrough", 8)
demo = [("1", "Open the live URL", "No signup, no install required"),
        ("2", "Tap the sample profile", "One tap fills a realistic rural household"),
        ("3", "Read the ranked matches", "Each card shows WHY you qualify"),
        ("4", "Open My Plan", "₹ estimated annual value + document bar"),
        ("5", "Check documents", "Missing docs → issuing office + timeline"),
        ("6", "Generate an RTI letter", "Legally-shaped, printable today"),
        ("7", "Paste a scam SMS", "Fraud Shield: risk /100 + exact actions")]
for i, (n, t_, d) in enumerate(demo):
    l = Inches(0.6) + Inches(6.15) * (i % 2)
    t = Inches(1.9) + Inches(1.28) * (i // 2)
    box(s, l, t, Inches(5.85), Inches(1.1), fill=WHITE, line=LINE, rounded=True, radius=0.1)
    box(s, l + Inches(0.16), t + Inches(0.2), Inches(0.62), Inches(0.62), fill=NAVY, rounded=True, radius=0.3)
    text(s, l + Inches(0.16), t + Inches(0.29), Inches(0.62), Inches(0.5), [(n, 20, True, WHITE, 0, False)], align=PP_ALIGN.CENTER)
    text(s, l + Inches(0.95), t + Inches(0.15), Inches(4.75), Inches(0.4), [(t_, 15, True, NAVY, 0, False)])
    text(s, l + Inches(0.95), t + Inches(0.56), Inches(4.75), Inches(0.4), [(d, 12, False, MUTED, 0, False)])
chip(s, Inches(0.6), Inches(6.1), Inches(12.13), Inches(0.62),
     "🔗  https://webapp-kohl-six-95.vercel.app", fill=PANEL, color=NAVY, size=15)
footer(s)
notes(s, "This is the demo path we will walk the judges through. Every step is live on the public URL right now, and every step also works with the network switched off.")

# ───────────────────────── 9. ARCHITECTURE ─────────────────────────
s = S()
header(s, "Architecture", "Zero build step · one serverless function", 9)
tiers = [("Citizen device", "static app shell · public/", SAFFRON,
          ["index.html · app.css · app.js", "schemes.js — 43 schemes", "i18n.js — 13 languages", "engine.js — eligibility/docs/fraud", "sw.js — offline cache (PWA)"]),
         ("Vercel serverless", "api/ai.js · api/kb.js", NAVY,
          ["One Node.js function", "3 modes: chat | letter | fraud", "Grounded prompt from the KB", "Rate-limited, model fallback", "Returns fallback:true on any error"]),
         ("LLM (optional)", "OpenAI-compatible endpoint", GREEN,
          ["gpt-5-mini → gpt-5-nano", "Provider-agnostic", "Never the source of truth", "Swappable via env vars", "Absent → offline engine answers"])]
for i, (title, sub, c, lines) in enumerate(tiers):
    l = Inches(0.6) + Inches(4.11) * i
    box(s, l, Inches(1.95), Inches(3.86), Inches(3.7), fill=WHITE, line=LINE, rounded=True, radius=0.07)
    box(s, l, Inches(1.95), Inches(3.86), Inches(0.75), fill=c, rounded=True, radius=0.12)
    box(s, l, Inches(2.45), Inches(3.86), Inches(0.25), fill=c)
    text(s, l + Inches(0.2), Inches(2.05), Inches(3.5), Inches(0.3), [(title, 14.5, True, WHITE, 0, False)])
    text(s, l + Inches(0.2), Inches(2.35), Inches(3.5), Inches(0.3), [(sub, 11, False, WHITE, 0, False)])
    text(s, l + Inches(0.22), Inches(2.9), Inches(3.5), Inches(2.6),
         [(x, 11.5, False, INK, 0, True) for x in lines])
    if i < 2:
        text(s, l + Inches(3.86), Inches(3.5), Inches(0.25), Inches(0.4), [("›", 22, True, MUTED, 0, False)], align=PP_ALIGN.CENTER)
box(s, Inches(0.6), Inches(5.85), Inches(12.13), Inches(0.85), fill=PANEL, rounded=True, radius=0.08)
text(s, Inches(0.9), Inches(5.98), Inches(11.5), Inches(0.6),
     [("Deliberate choice: the same api/ai.js handler runs under the local dev server and on Vercel — local and production behaviour are identical.", 13, True, NAVY, 0, False)])
footer(s)
notes(s, "Three tiers, minimal surface. The front end is fully static and cacheable, the back end is a single stateless function, and the LLM is optional by design. There is no database to scale and no bundler in the loop.")

# ───────────────────────── 10. KNOWLEDGE BASE ─────────────────────────
s = S()
header(s, "Knowledge base", "Real schemes, real rules, real portals", 10)
stats = [("43", "Government schemes", NAVY), ("30", "Categories covered", SAFFRON),
         ("83", "Documents with guides", GREEN), ("12", "National helplines", NAVY),
         ("13", "Indian languages", GREEN)]
for i, (n, l, c) in enumerate(stats):
    x = Inches(0.6) + Inches(2.47) * i
    box(s, x, Inches(1.9), Inches(2.3), Inches(1.35), fill=PANEL, rounded=True, radius=0.1)
    text(s, x, Inches(2.02), Inches(2.3), Inches(0.6), [(n, 32, True, c, 0, False)], align=PP_ALIGN.CENTER)
    text(s, x, Inches(2.68), Inches(2.3), Inches(0.5), [(l, 11.5, False, MUTED, 0, False)], align=PP_ALIGN.CENTER)
text(s, Inches(0.6), Inches(3.42), Inches(12.1), Inches(0.4),
     [("Representative schemes", 15, True, NAVY, 0, False)])
names = ["PM-Kisan", "PM-JAY (Ayushman)", "PM Awas Yojana (G&U)", "MGNREGA", "NFSA", "NSAP pensions",
         "Sukanya Samriddhi", "Atal Pension", "Mudra", "PM SVANidhi", "Ujjwala", "Jal Jeevan Mission",
         "RTE", "PM Vishwakarma", "e-Shram", "UDID", "DigiLocker", "Passport Seva", "Ni-kshay (TB)", "RTI"]
for i, nm in enumerate(names):
    col, row = i % 4, i // 4
    x = Inches(0.6) + Inches(3.07) * col
    y = Inches(3.85) + Inches(0.5) * row
    box(s, x, y, Inches(2.9), Inches(0.4), fill=WHITE, line=LINE, rounded=True, radius=0.25)
    text(s, x + Inches(0.12), y + Inches(0.07), Inches(2.7), Inches(0.3), [(nm, 10.5, False, INK, 0, False)])
text(s, Inches(0.6), Inches(6.5), Inches(12.1), Inches(0.4),
     [("Every entry carries a machine-readable rules{} block, its official .gov.in portal, required documents and application steps.", 12, False, MUTED, 0, False)])
footer(s)
notes(s, "The knowledge base is the product's substance. Each scheme is structured data with a rule block, an official portal, documents and steps — which is what lets the engine explain eligibility instead of guessing.")

# ───────────────────────── 11. ACCESSIBILITY ─────────────────────────
s = S()
header(s, "Inclusion", "Built for a first-time internet user", 11)
cards = [("🗣️", "13 Indian languages", ["English, Hindi, Bengali, Tamil, Telugu,", "Marathi, Gujarati, Kannada, Malayalam,", "Punjabi, Odia, Assamese, Urdu (RTL)"]),
         ("🎙️", "Voice in and out", ["Speak the question, hear the answer", "Web Speech API, locale-matched", "Per-language voice selection"]),
         ("🔎", "Simple Mode", ["One tap: bigger text, calmer layout", "Hides decorative elements", "For users who have never filled a form"]),
         ("♿", "Accessible by default", ["Font scaling to 140%", "High-contrast + dark mode", "Semantic HTML, ARIA live regions"])]
for i, (ic, t_, lines) in enumerate(cards):
    l = Inches(0.6) + Inches(3.11) * i
    box(s, l, Inches(1.95), Inches(2.9), Inches(3.4), fill=WHITE, line=LINE, rounded=True, radius=0.08)
    text(s, l, Inches(2.2), Inches(2.9), Inches(0.7), [(ic, 30, False, INK, 0, False)], align=PP_ALIGN.CENTER)
    text(s, l + Inches(0.18), Inches(3.0), Inches(2.54), Inches(0.7), [(t_, 14, True, NAVY, 0, False)], align=PP_ALIGN.CENTER)
    text(s, l + Inches(0.18), Inches(3.72), Inches(2.54), Inches(1.5),
         [(x, 10.5, False, MUTED, 0, True) for x in lines], align=PP_ALIGN.CENTER)
box(s, Inches(0.6), Inches(5.55), Inches(12.13), Inches(1.1), fill=PANEL, rounded=True, radius=0.08)
text(s, Inches(0.9), Inches(5.72), Inches(11.5), Inches(0.8),
     [("Privacy by design:  profile, tracker and chat live only in the browser's localStorage — nothing is uploaded.", 13, True, NAVY, 0, False),
      ("Only free-text the user explicitly submits is sent to the LLM, and only while online.", 12, False, MUTED, 6, False)])
footer(s)
notes(s, "Inclusion is not a nice-to-have here — it is the whole point. The app is usable by someone who has never filled an online form, in their own language, by voice, on a small screen.")

# ───────────────────────── 12. DEPLOYMENT & TESTING ─────────────────────────
s = S()
header(s, "Deployment & verification", "Live, open-source, and tested", 12)
box(s, Inches(0.6), Inches(1.9), Inches(6.0), Inches(2.35), fill=WHITE, line=LINE, rounded=True, radius=0.07)
box(s, Inches(0.6), Inches(1.9), Inches(0.07), Inches(2.35), fill=GREEN)
text(s, Inches(0.85), Inches(2.05), Inches(5.5), Inches(0.4), [("✅  Live in production", 16, True, NAVY, 0, False)])
text(s, Inches(0.85), Inches(2.5), Inches(5.5), Inches(1.6),
     [("Vercel — static + one serverless function", 12.5, False, INK, 0, True),
      ("HTTP 200 · public · no auth wall", 12.5, False, INK, 0, True),
      ("https://webapp-kohl-six-95.vercel.app", 12, True, GREEN, 0, True),
      ("https://github.com/no6546559-sketch/bharat-setu", 12, True, NAVY, 0, True)])
box(s, Inches(6.75), Inches(1.9), Inches(5.98), Inches(2.35), fill=WHITE, line=LINE, rounded=True, radius=0.07)
box(s, Inches(6.75), Inches(1.9), Inches(0.07), Inches(2.35), fill=SAFFRON)
text(s, Inches(7.0), Inches(2.05), Inches(5.5), Inches(0.4), [("🧪  63 assertions, 0 failures", 16, True, NAVY, 0, False)])
text(s, Inches(7.0), Inches(2.5), Inches(5.6), Inches(1.6),
     [("Run against the SHIPPED bytes, not a re-implementation:", 11.5, False, MUTED, 0, False),
      ("eligibility · documents · fraud · NLU", 12, False, INK, 4, True),
      ("grounded answers · letters · i18n", 12, False, INK, 0, True),
      ("live /api/ai endpoint + graceful fallback", 12, False, INK, 0, True),
      ("Plus a build validator on every scheme.", 11.5, False, MUTED, 4, False)])
box(s, Inches(0.6), Inches(4.45), Inches(12.13), Inches(2.0), fill=NAVY, rounded=True, radius=0.06)
text(s, Inches(0.95), Inches(4.68), Inches(11.5), Inches(1.6),
     [("API surface", 15, True, WHITE, 0, False),
      ("GET  /api/ai    →  { ok, ai_enabled, model, schemes, modes }", 13, False, RGBColor(0xDD,0xE6,0xFA), 8, False),
      ("POST /api/ai    →  mode: chat  |  letter  |  fraud", 13, False, RGBColor(0xDD,0xE6,0xFA), 4, False),
      ("Any failure returns { ok:false, fallback:true } and the client answers offline.", 12.5, True, RGBColor(0x9F,0xE0,0xA8), 8, False)])
footer(s)
notes(s, "Both deliverables are live and verified. The test suite runs against the actual shipped files, which is how we caught and fixed a real engine bug during development.")

# ───────────────────────── 13. CRITERIA MAPPING ─────────────────────────
s = S()
header(s, "Evaluation criteria", "How Bharat Setu scores on each axis", 13)
rows = [("Innovation & Originality", "Explainable eligibility (verdict with evidence); grounded AI that degrades to a deterministic engine; ₹ benefit estimator; document intelligence; Fraud Shield that explains why.", SAFFRON),
        ("Technical Implementation", "43-scheme machine-readable KB; custom NLU; 13-language i18n; PWA offline; service worker; serverless proxy with rate limiting + model fallback; 63-test suite; build validator.", NAVY),
        ("Real-World Impact", "Targets the last-mile information gap in India's welfare delivery, aimed at the exact groups most excluded.", GREEN),
        ("Usability", "13 languages incl. RTL; voice in/out; font scaling; high contrast; dark mode; Simple Mode; plain-language glossary; one-tap demo profile.", SAFFRON),
        ("Scalability", "Fully static front end on a global CDN; stateless function; the KB is a data file so schemes/languages are additive; no database to scale.", NAVY),
        ("Presentation & Demo", "Live URL + GitHub + written report + this deck; a guided 60-second demo path.", GREEN)]
y = Inches(1.85)
for name, desc, c in rows:
    box(s, Inches(0.6), y, Inches(12.13), Inches(0.8), fill=WHITE, line=LINE, rounded=True, radius=0.1)
    box(s, Inches(0.6), y, Inches(0.07), Inches(0.8), fill=c)
    text(s, Inches(0.82), y + Inches(0.2), Inches(2.75), Inches(0.5), [(name, 13, True, NAVY, 0, False)])
    text(s, Inches(3.65), y + Inches(0.11), Inches(8.95), Inches(0.65), [(desc, 10.5, False, INK, 0, False)])
    y += Inches(0.86)
footer(s)
notes(s, "This slide maps directly onto the judging rubric so the evaluators can score quickly. Every criterion is backed by something concrete in the product rather than a claim.")

# ───────────────────────── 14. CLOSING ─────────────────────────
s = S()
box(s, 0, 0, W, H, fill=WHITE)
box(s, 0, 0, Inches(0.22), H, fill=SAFFRON)
box(s, Inches(0.22), 0, Inches(0.08), H, fill=WHITE)
box(s, Inches(0.30), 0, Inches(0.08), H, fill=GREEN)
text(s, Inches(1.0), Inches(0.85), Inches(11.3), Inches(0.4),
     [("CLOSING", 13, True, SAFFRON, 0, False)])
text(s, Inches(1.0), Inches(1.25), Inches(11.3), Inches(1.2),
     [("The hardest problem in welfare delivery", 30, True, NAVY, 0, False),
      ("is not eligibility — it is access.", 30, True, GREEN, 4, False)])
text(s, Inches(1.0), Inches(2.75), Inches(11), Inches(0.9),
     [("Bharat Setu puts an explainable, offline, multilingual bridge in the citizen's pocket —",
       15.5, False, INK, 0, False),
      ("so that the benefits they are owed are no longer hidden behind a form they cannot read.", 15.5, False, INK, 4, False)])
for i, (t_, c) in enumerate([("Live on Vercel", GREEN), ("Open source on GitHub", NAVY),
                             ("63/63 tests green", GREEN), ("Works offline", SAFFRON)]):
    chip(s, Inches(1.0) + Inches(2.85) * i, Inches(3.85), Inches(2.65), Inches(0.5), t_, fill=PANEL, color=c)
box(s, Inches(1.0), Inches(4.6), Inches(11.33), Inches(1.25), fill=PANEL, rounded=True, radius=0.07)
text(s, Inches(1.3), Inches(4.78), Inches(10.8), Inches(1.0),
     [("Live:  https://webapp-kohl-six-95.vercel.app", 14, True, NAVY, 0, False),
      ("Source:  https://github.com/no6546559-sketch/bharat-setu", 14, False, MUTED, 5, False)])
box(s, 0, Inches(6.6), W, Inches(0.9), fill=NAVY)
text(s, Inches(1.0), Inches(6.78), Inches(11.3), Inches(0.5),
     [("🚨 112 emergency   ·   👩 181 women   ·   💳 1930 cyber fraud   ·   🧒 1098 child", 13, True, WHITE, 0, False)])
notes(s, "To close: the technology is live, tested and open source. The point is simple — access, in the citizen's own language, on the phone they already have, whether or not the network cooperates.")

os.makedirs("deliverables", exist_ok=True)
out = "deliverables/Bharat_Setu_Pitch_Deck.pptx"
prs.save(out)
print(f"✓ saved {out}  ({len(prs.slides.__iter__.__self__._sldIdLst)} slides, {os.path.getsize(out)} bytes)")
