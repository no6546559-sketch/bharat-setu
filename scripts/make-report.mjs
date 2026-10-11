/* Bharat Setu — build a polished, self-contained project report.
   Renders REPORT.md into a print-ready HTML document with a tricolour design
   system, then hands off to LibreOffice for PDF conversion. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const md = fs.readFileSync(path.join(ROOT, 'REPORT.md'), 'utf8');

/* ————— minimal, safe Markdown → HTML (headings, tables, lists, code, quotes, rules, bold/italic/links) ————— */
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = s => esc(s)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

function renderMarkdown(src) {
  const lines = src.split('\n');
  const out = [];
  let i = 0, inCode = false, codeBuf = [];
  let listType = null;

  const closeList = () => { if (listType) { out.push(`</${listType}>`); listType = null; } };

  while (i < lines.length) {
    let line = lines[i];

    // fenced code
    if (line.trim().startsWith('```')) {
      if (!inCode) { inCode = true; codeBuf = []; }
      else { inCode = false; out.push(`<pre><code>${esc(codeBuf.join('\n'))}</code></pre>`); }
      i++; continue;
    }
    if (inCode) { codeBuf.push(line); i++; continue; }

    // table
    if (/^\s*\|/.test(line) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      closeList();
      const header = line.split('|').slice(1, -1).map(c => c.trim());
      i += 2;
      const rows = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        rows.push(lines[i].split('|').slice(1, -1).map(c => c.trim()));
        i++;
      }
      out.push('<table><thead><tr>' + header.map(h => `<th>${inline(h)}</th>`).join('') + '</tr></thead><tbody>' +
        rows.map(r => '<tr>' + r.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') + '</tbody></table>');
      continue;
    }

    // headings
    let m;
    if ((m = line.match(/^(#{1,4})\s+(.*)$/))) {
      closeList();
      const lvl = m[1].length;
      const txt = m[2];
      const id = txt.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      out.push(`<h${lvl} id="${id}">${inline(txt)}</h${lvl}>`);
      i++; continue;
    }

    // horizontal rule
    if (/^\s*---+\s*$/.test(line)) { closeList(); out.push('<hr>'); i++; continue; }

    // blockquote
    if (/^\s*>\s?/.test(line)) {
      closeList();
      const buf = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^\s*>\s?/, '')); i++; }
      out.push(`<blockquote>${inline(buf.join(' '))}</blockquote>`);
      continue;
    }

    // unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      if (listType !== 'ul') { closeList(); out.push('<ul>'); listType = 'ul'; }
      out.push(`<li>${inline(line.replace(/^\s*[-*]\s+/, ''))}</li>`);
      i++; continue;
    }
    // ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      if (listType !== 'ol') { closeList(); out.push('<ol>'); listType = 'ol'; }
      out.push(`<li>${inline(line.replace(/^\s*\d+\.\s+/, ''))}</li>`);
      i++; continue;
    }

    // blank
    if (!line.trim()) { closeList(); i++; continue; }

    // paragraph (gather until blank/special)
    closeList();
    const pbuf = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|\s*[-*]\s|\s*\d+\.\s|\s*\||\s*>|\s*```|\s*---+\s*$)/.test(lines[i])) {
      pbuf.push(lines[i]); i++;
    }
    out.push(`<p>${inline(pbuf.join(' '))}</p>`);
  }
  closeList();
  return out.join('\n');
}

const body = renderMarkdown(md);

/* ————— extract the title + meta for a cover block ————— */
const titleMatch = md.match(/^#\s+(.*)$/m);
const TITLE = titleMatch ? titleMatch[1] : 'Bharat Setu — Project Report';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(TITLE)}</title>
<style>
  :root{
    --saffron:#FF9933; --green:#138808; --navy:#0B3D91;
    --ink:#141B2E; --muted:#5A647A; --line:#D8DEEC; --panel:#F4F6FB;
  }
  *{box-sizing:border-box}
  html{font-size:16px}
  body{
    margin:0; background:#fff; color:var(--ink);
    font-family:"Segoe UI",Calibri,-apple-system,Roboto,Helvetica,Arial,sans-serif;
    line-height:1.62; -webkit-print-color-adjust:exact; print-color-adjust:exact;
  }
  .tricolour{height:10px;display:flex}
  .tricolour i{flex:1}
  .tricolour i:nth-child(1){background:var(--saffron)}
  .tricolour i:nth-child(2){background:#fff}
  .tricolour i:nth-child(3){background:var(--green)}
  .wrap{max-width:900px;margin:0 auto;padding:0 34px 70px}
  header.cover{padding:34px 0 26px;border-bottom:3px solid var(--navy);margin-bottom:26px}
  .kicker{font-size:.72rem;font-weight:800;letter-spacing:.16em;color:var(--saffron);text-transform:uppercase;margin:0 0 8px}
  h1{font-size:2.5rem;line-height:1.12;color:var(--navy);margin:0 0 6px;font-weight:800}
  .sub{font-size:1.02rem;color:var(--muted);margin:0}
  .meta{margin-top:16px;display:flex;flex-wrap:wrap;gap:8px}
  .meta span{background:var(--panel);border:1px solid var(--line);border-radius:999px;padding:5px 13px;font-size:.8rem;color:var(--navy);font-weight:600}
  h2{font-size:1.5rem;color:var(--navy);margin:34px 0 12px;padding-bottom:7px;border-bottom:2px solid var(--panel);font-weight:800;break-after:avoid}
  h3{font-size:1.13rem;color:var(--navy);margin:22px 0 8px;font-weight:700;break-after:avoid}
  h4{font-size:1rem;color:var(--ink);margin:16px 0 6px;font-weight:700;break-after:avoid}
  p{margin:9px 0}
  a{color:var(--navy);word-break:break-word}
  strong{color:var(--ink)}
  code{background:var(--panel);border:1px solid var(--line);border-radius:5px;padding:1px 5px;font-size:.87em;font-family:ui-monospace,Menlo,Consolas,monospace}
  pre{background:var(--panel);border:1px solid var(--line);border-left:4px solid var(--navy);border-radius:8px;padding:14px 16px;overflow:auto;break-inside:avoid}
  pre code{background:none;border:none;padding:0;font-size:.82rem;line-height:1.5}
  blockquote{margin:14px 0;padding:12px 18px;background:#FFF8EF;border-left:4px solid var(--saffron);border-radius:8px;color:#5b4a2f}
  table{width:100%;border-collapse:collapse;margin:14px 0;font-size:.88rem;break-inside:avoid}
  th,td{border:1px solid var(--line);padding:9px 11px;text-align:left;vertical-align:top}
  th{background:var(--panel);color:var(--navy);font-weight:700}
  tbody tr:nth-child(even){background:#FAFBFE}
  ul,ol{margin:10px 0;padding-left:24px}
  li{margin:5px 0}
  hr{border:none;border-top:1px solid var(--line);margin:26px 0}
  .badge-row{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0 4px}
  .badge-row span{background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:6px 12px;font-size:.8rem;color:var(--navy);font-weight:600}
  footer{margin-top:40px;padding-top:18px;border-top:3px solid var(--navy);font-size:.82rem;color:var(--muted)}
  @page{size:A4;margin:16mm 14mm}
  @media print{
    .wrap{max-width:none;padding:0}
    h2{break-after:avoid} h3{break-after:avoid}
    a{color:var(--navy)}
  }
</style>
</head>
<body>
<div class="tricolour"><i></i><i></i><i></i></div>
<div class="wrap">
<header class="cover">
  <p class="kicker">Hackathon Submission · AI for Bharat &amp; Public Services</p>
  <h1>Bharat Setu · भारत सेतु</h1>
  <p class="sub">An AI bridge between Indian citizens and the public services they are entitled to — multilingual, explainable, offline-first.</p>
  <div class="badge-row">
    <span>43 schemes</span><span>30 categories</span><span>83 documents</span>
    <span>12 helplines</span><span>13 languages</span><span>63/63 tests</span><span>₹0 to the citizen</span>
  </div>
  <div class="meta">
    <span>Live: webapp-kohl-six-95.vercel.app</span>
    <span>Source: github.com/no6546559-sketch/bharat-setu</span>
  </div>
</header>
<main>${body}</main>
<footer>
  <strong>Bharat Setu · भारत सेतु</strong> — an independent citizen-help tool built for a hackathon. Not a government website.<br>
  Helplines: 🚨 112 emergency · 👩 181 women · 💳 1930 cyber fraud · 🧒 1098 child
</footer>
</div>
</body>
</html>`;

fs.mkdirSync(path.join(ROOT, 'deliverables'), { recursive: true });
const outHtml = path.join(ROOT, 'deliverables', 'Bharat_Setu_Project_Report.html');
fs.writeFileSync(outHtml, html);
console.log(`✓ report HTML → ${path.relative(ROOT, outHtml)}  (${(html.length / 1024).toFixed(1)} KB)`);
