// scripts/verify-cv.mjs
// Assert the expected committed artifacts exist under public/cv:
// <variant>-<lang>.pdf and preview_<variant>-<lang>.webp for every variant x
// language. Vite copies public/ into dist/ at build time.
import { existsSync } from "node:fs";

const VARIANTS = ["fullstack", "industry"];
const LANGS = ["en", "zh"];

const missing = [];
for (const variant of VARIANTS) {
  for (const lang of LANGS) {
    for (const file of [
      `public/cv/${variant}-${lang}.pdf`,
      `public/cv/preview_${variant}-${lang}.webp`,
    ]) {
      if (!existsSync(file)) missing.push(file);
    }
  }
}

if (missing.length) {
  console.error("MISS: " + missing.join(", "));
  console.error("Run `npm run cv:render` and commit public/cv.");
  process.exit(1);
}
console.log(
  `CV OK: ${VARIANTS.length * LANGS.length} PDFs + ` +
    `${VARIANTS.length * LANGS.length} previews`,
);
