import { WORLD_COLS, WORLD_ROWS } from "./world";

// Agent 世界地图默写 benchmark 提示词：只给规则与空网格 spec，不泄露答案
export function buildBenchmarkPrompt(): string {
  return [
    "# World-Map Memorization Benchmark (128x64)",
    "",
    "You are tested on whether you can reproduce a world map from memory.",
    "",
    "## Grid spec",
    `- COLS=${WORLD_COLS} (longitude), ROWS=${WORLD_ROWS} (latitude)`,
    "- col c covers lng in [-180 + 360*c/128, -180 + 360*(c+1)/128)",
    "- row r covers lat in [90 - 180*(r+1)/64, 90 - 180*r/64)",
    "- cell center: lng = -180 + (c+0.5)*360/128, lat = 90 - (r+0.5)*180/64",
    "- value: 1 = mostly land, 0 = mostly ocean/water",
    "",
    "## Task",
    `1. For EVERY cell (r = 0..${WORLD_ROWS - 1}, c = 0..${WORLD_COLS - 1}), decide 0 or 1.`,
    "2. Query point by point: each cell is an independent 0/1 classification.",
    "3. Do NOT output explanations, only the matrix plus a render.",
    "",
    "## Output format (strict, machine-checkable)",
    "```matrix",
    "<64 lines total, each line exactly 128 chars of 0/1, no spaces, no commas>",
    "```",
    "",
    "## Render",
    "After the matrix, render it as dots (one dot per cell with value 1) on a",
    "128x64 grid, e.g. with canvas/SVG, so a human can visually verify the continents.",
    "",
    "## Self-check before answering",
    "- Exactly 64 lines, each exactly 128 characters.",
    "- Only characters 0 and 1 inside the fence.",
    "- Americas on the left, Europe/Africa in the middle, Asia/Australia on the right.",
    "",
    "Now produce the matrix and the render.",
    "",
  ].join("\n");
}

export function downloadWorldMapBenchmark(): void {
  const blob = new Blob([buildBenchmarkPrompt()], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "world-map-benchmark.txt";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
