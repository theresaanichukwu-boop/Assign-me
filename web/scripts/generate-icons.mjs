// Generates AssignMe PWA icons from SVG (navy rounded square, serif "A", coral bar).
// Run: node scripts/generate-icons.mjs   (uses the project's sharp dependency)
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "icons");
mkdirSync(root, { recursive: true });

function svg(size, { maskable = false } = {}) {
  const r = size * 0.22;
  // Geometric "A" (font-independent): apex, legs, crossbar, coral baseline.
  const a = `<path d="M50 14 L80 86 L67 86 L50 42 L33 86 L20 86 Z" fill="#FFFFFF"/>
  <rect x="39" y="63" width="22" height="8" rx="2" fill="#FFFFFF"/>
  <rect x="22" y="78" width="56" height="7" rx="3.5" fill="#D95D39"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="22" fill="#0F2A43"/>
  ${maskable ? `<g transform="translate(12,12) scale(0.76)">${a}</g>` : a}
</svg>`;
}

const targets = [
  ["icon-192.png", 192, {}],
  ["icon-512.png", 512, {}],
  ["maskable-512.png", 512, { maskable: true }],
  ["apple-touch-icon.png", 180, {}],
  ["favicon-32.png", 32, {}],
];

for (const [name, size, opts] of targets) {
  await sharp(Buffer.from(svg(size, opts)))
    .png()
    .toFile(join(root, name));
  console.log("wrote", name);
}
