/* Bharat Setu — generate PNG app icons (192/512) with zero dependencies.
   Writes a minimal but valid PNG using zlib + manual chunk assembly. */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'static');

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = c ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const t = Buffer.from(type, 'ascii');
  const body = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/* Draw the mark: navy diagonal gradient, saffron/white/green arcs, white disc with "भा"-like glyph block. */
function drawIcon(size) {
  const px = Buffer.alloc(size * size * 4);
  const set = (x, y, r, g, b, a = 255) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = a;
  };
  const lerp = (a, b, t) => a + (b - a) * t;
  const R = size * 0.21; // corner radius

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // rounded-rect mask
      const cx = Math.min(Math.max(x, R), size - 1 - R);
      const cy = Math.min(Math.max(y, R), size - 1 - R);
      const d = Math.hypot(x - cx, y - cy);
      if (d > R) continue;
      const t = (x / size) * 0.5 + (y / size) * 0.5;
      // navy → deep green gradient
      const r = Math.round(lerp(11, 15, t)), g = Math.round(lerp(61, 81, t)), b = Math.round(lerp(145, 50, t));
      set(x, y, r, g, b);
    }
  }

  // three arches (saffron / white / green) like a bridge
  const arches = [
    { c: [255, 153, 51], o: -0.10, w: 0.045 },
    { c: [255, 255, 255], o: 0.00, w: 0.032 },
    { c: [19, 136, 8], o: 0.10, w: 0.045 },
  ];
  const cyBase = size * 0.80, amp = size * 0.26, wl = size * 0.80, x0 = size * 0.12;
  for (const a of arches) {
    for (let x = Math.floor(x0); x < x0 + wl; x++) {
      const p = (x - x0) / wl;
      const yc = cyBase + a.o * size - Math.sin(p * Math.PI) * amp;
      const half = a.w * size / 2;
      for (let dy = -half; dy <= half; dy++) {
        const y = Math.round(yc + dy);
        const edge = Math.abs(dy) > half - 1 ? 0.7 : 1;
        const i = (y * size + x) * 4;
        if (i >= 0 && i < px.length) {
          px[i] = Math.round(lerp(px[i], a.c[0], edge));
          px[i + 1] = Math.round(lerp(px[i + 1], a.c[1], edge));
          px[i + 2] = Math.round(lerp(px[i + 2], a.c[2], edge));
          px[i + 3] = 255;
        }
      }
    }
  }

  // inner white disc
  const cx2 = size / 2, cy2 = size * 0.40, rr = size * 0.155;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (Math.hypot(x - cx2, y - cy2) <= rr) {
      const i = (y * size + x) * 4;
      px[i] = 255; px[i + 1] = 255; px[i + 2] = 255; px[i + 3] = 255;
    }
  }
  // navy "भ" style glyph: vertical stroke + horizontal bar + loop (simple geometric)
  const ink = [11, 61, 145];
  const gw = size * 0.012;
  const drawRect = (x0, y0, w, h) => {
    for (let y = Math.round(y0); y < y0 + h; y++) for (let x = Math.round(x0); x < x0 + w; x++) {
      const i = (y * size + x) * 4; if (i < 0 || i >= px.length) continue;
      px[i] = ink[0]; px[i + 1] = ink[1]; px[i + 2] = ink[2]; px[i + 3] = 255;
    }
  };
  const s = size * 0.001;
  drawRect(cx2 - 46 * s, cy2 - 58 * s, gw, 118 * s);            // stem
  drawRect(cx2 - 46 * s, cy2 - 58 * s, 96 * s, gw);             // top bar
  drawRect(cx2 - 6 * s, cy2 - 58 * s, gw, 62 * s);              // right of top bar
  drawRect(cx2 - 46 * s, cy2 + 14 * s, 96 * s, gw);             // mid bar
  for (let ang = 0; ang < 360; ang += 3) {                       // bowl
    const rad = ang * Math.PI / 180;
    const bx = cx2 + 20 * s + Math.cos(rad) * 26 * s;
    const by = cy2 + 48 * s + Math.sin(rad) * 26 * s;
    for (let dy = -gw / 2; dy <= gw / 2; dy++) for (let dx = -gw / 2; dx <= gw / 2; dx++) {
      const i = (Math.round(by + dy) * size + Math.round(bx + dx)) * 4;
      if (i >= 0 && i < px.length) { px[i] = ink[0]; px[i + 1] = ink[1]; px[i + 2] = ink[2]; px[i + 3] = 255; }
    }
  }
  return px;
}

function encodePNG(px, size) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter: none
    px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const size of [192, 512]) {
  const png = encodePNG(drawIcon(size), size);
  fs.writeFileSync(path.join(OUT, `icon-${size}.png`), png);
  console.log(`  ✓ icon-${size}.png  ${(png.length / 1024).toFixed(1)} KB`);
}
console.log('icons written to public/static/');
