// scripts/render-cv.mjs
// Render every resume variant in both languages, then publish the 8 artifacts
// (4 PDFs + 4 previews) to public/cv. CI does not render: run this locally
// whenever resume/** changes, then commit public/cv.
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { join } from "node:path";

const VARIANTS = ["fullstack"];
const LANGS = ["en", "zh"];
const STAGE = "tmp/cv";
const OUT = "public/cv";

// Prefer the project venv: it is the environment with the Python deps and a
// supported interpreter. Fall back to PATH for machines without a venv.
const VENV_PYTHON =
  process.platform === "win32"
    ? ".venv/Scripts/python.exe"
    : ".venv/bin/python";
const PYTHON =
  [process.env.CV_PYTHON, VENV_PYTHON]
    .filter(Boolean)
    .find((candidate) => existsSync(candidate)) ??
  (process.platform === "win32" ? "python" : "python3");

rmSync(STAGE, { recursive: true, force: true });
mkdirSync(STAGE, { recursive: true });

let failed = false;
for (const variant of VARIANTS) {
  for (const lang of LANGS) {
    console.log(`\n=== render ${variant} [${lang}] ===`);
    const result = spawnSync(
      PYTHON,
      [
        "resume/render.py",
        `resume/data/variants/${variant}.json`,
        STAGE,
        "--lang",
        lang,
        "--placement",
        "resume/placement.json",
      ],
      { stdio: "inherit" },
    );
    if (result.status !== 0) {
      if (result.error) console.error(result.error.message);
      failed = true;
    }
  }
}

if (failed) {
  console.error("\ncv:render FAILED (see pipeline output above)");
  console.error(`Nothing was published to ${OUT}.`);
  process.exit(1);
}

// Publish only after every render succeeded, and drop outputs left behind by
// variants that no longer exist.
mkdirSync(OUT, { recursive: true });
for (const entry of readdirSync(OUT)) {
  if (entry.endsWith(".pdf") || entry.startsWith("preview_")) {
    rmSync(join(OUT, entry), { force: true });
  }
}
for (const variant of VARIANTS) {
  for (const lang of LANGS) {
    for (const file of [
      `${variant}-${lang}.pdf`,
      `preview_${variant}-${lang}.webp`,
    ]) {
      copyFileSync(join(STAGE, file), join(OUT, file));
    }
  }
}

console.log(
  `\ncv:render OK: ${VARIANTS.length} variants x ${LANGS.length} langs -> ${OUT}`,
);
