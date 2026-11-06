// scripts/verify-cv.mjs
// Assert the expected dist/cv artifacts exist: <variant>-<lang>.pdf and
// preview_<variant>-<lang>.png for every variant x language.
import { existsSync } from "node:fs";

const VARIANTS = ["fullstack", "industry"];
const LANGS = ["en", "zh"];

const missing = [];
for (const variant of VARIANTS) {
  for (const lang of LANGS) {
    for (const file of [
      `dist/cv/${variant}-${lang}.pdf`,
      `dist/cv/preview_${variant}-${lang}.png`,
    ]) {
      if (!existsSync(file)) missing.push(file);
    }
  }
}

if (missing.length) {
  console.error("MISS: " + missing.join(", "));
  process.exit(1);
}
console.log(
  `CV OK: ${VARIANTS.length * LANGS.length} PDFs + ` +
    `${VARIANTS.length * LANGS.length} previews`,
);
