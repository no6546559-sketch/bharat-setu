import fs from 'fs';
const src = fs.readFileSync('public/static/schemes.js', 'utf8');
// crude but sufficient: evaluate the file with a window shim
globalThis.window = globalThis;
const mod = await import('data:text/javascript;base64,' + Buffer.from(src).toString('base64'));
const SCHEMES = globalThis.SCHEMES, CONTACTS = globalThis.CONTACTS, GLOSSARY = globalThis.GLOSSARY;
if (!SCHEMES || !SCHEMES.length) { console.error('no schemes'); process.exit(1); }
const KB = SCHEMES.map(s => ({
  id: s.id, name: s.name, name_hi: s.name_hi || null, tag: s.tag,
  cats: s.cats, benefit: s.benefit, docs: s.docs, how: s.how, apply_url: s.apply_url, desc: s.desc,
  rules: s.rules,
}));
const KB_TEXT = KB.map(s => [
  `### ${s.name}${s.name_hi ? ` / ${s.name_hi}` : ''} [${s.tag}]`,
  `benefit: ${s.benefit}`,
  `details: ${s.desc}`,
  `documents: ${(s.docs||[]).join(', ')}`,
  `steps: ${(s.how||[]).join(' -> ')}`,
  `official: ${s.apply_url}`,
  s.rules && Object.keys(s.rules).length ? `eligibility data: ${JSON.stringify(s.rules)}` : '',
].filter(Boolean).join('\n')).join('\n\n');

const header = `/* AUTO-GENERATED from public/static/schemes.js — do not edit by hand.
   Regenerate with: node scripts/generate-kb.mjs   (keeps the serverless
   grounding context byte-identical to the client knowledge base). */
`;
fs.writeFileSync('api/kb.js', header +
  `export const KB = ${JSON.stringify(KB, null, 1)};\n\n` +
  `export const CONTACTS = ${JSON.stringify(CONTACTS, null, 1)};\n\n` +
  `export const GLOSSARY = ${JSON.stringify(GLOSSARY, null, 1)};\n\n` +
  'export const KB_TEXT = ' + JSON.stringify(KB_TEXT) + ';\n');
console.log('KB generated:', KB.length, 'schemes,', KB_TEXT.length, 'chars of grounding text');
