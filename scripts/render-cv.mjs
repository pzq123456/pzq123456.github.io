// scripts/render-cv.mjs
// Render every resume variant in both languages into dist/cv.
// Each render runs the full pipeline (schema -> normalize -> HTML -> PDF ->
// preview PNG -> QA) via resume/render.py.
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const VARIANTS = ["fullstack", "industry"];
const LANGS = ["en", "zh"];
const OUT = "dist/cv";

mkdirSync(OUT, { recursive: true });

let failed = false;
for (const variant of VARIANTS) {
  for (const lang of LANGS) {
    console.log(`\n=== render ${variant} [${lang}] ===`);
    const result = spawnSync(
      "python",
      [
        "resume/render.py",
        `resume/data/variants/${variant}.json`,
        OUT,
        "--lang",
        lang,
        "--placement",
        "resume/placement.json",
      ],
      { stdio: "inherit" },
    );
    if (result.status !== 0) failed = true;
  }
}

if (failed) {
  console.error("\ncv:render FAILED (see pipeline output above)");
  process.exit(1);
}
console.log(`\ncv:render OK: ${VARIANTS.length} variants x ${LANGS.length} langs`);
