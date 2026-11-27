/**
 * Pure, deterministic seed → params generation for procedurally painted
 * covers. No DOM, no React, no canvas: just data.
 *
 * Every visual axis draws from its own independent stream derived from the
 * seed, so neighbouring seeds don't produce correlated palettes/compositions.
 */

export interface CoverParams {
  /** Numeric phase offset fed to the shader. */
  seed: number;
  palette: number;
  composition: number;

  /** Framing: the same field seen at a different scale and crop. */
  zoom: number;
  panX: number;
  panY: number;

  /** Field shape. */
  noiseScale: number;
  warpStrength: number;
  fieldBias: number;

  /** Texture. */
  grainStrength: number;
  grainProfile: number;

  /** Light and print. */
  lightX: number;
  lightY: number;
  lightStrength: number;
  vignette: number;
  accentStrength: number;
  overprint: number;
  bandCount: number;
  contrast: number;
}

export interface CoverPalette {
  name: string;
  /** paper, mid ink, deep ink, overprint shadow */
  colors: readonly [string, string, string, string];
}

/** 1978 serigraph / retro-futurist ink sets. */
export const COVER_PALETTES: readonly CoverPalette[] = [
  { name: "Mojave Print", colors: ["#EAE1D0", "#D5B293", "#A86F54", "#5A4A42"] },
  { name: "Kyoto Moss", colors: ["#E6E3D6", "#B9BFA8", "#7B8871", "#C48F5A"] },
  { name: "Bauhaus Terracotta", colors: ["#ECE5D8", "#D89E7E", "#B35C44", "#3D4849"] },
  { name: "Nordic Fog", colors: ["#E2E4E1", "#B7C0BD", "#7C8B8C", "#A6634B"] },
  { name: "Desert Rose", colors: ["#EAE4DC", "#DEC0B8", "#9BA89C", "#697268"] },
  { name: "Archive Sage", colors: ["#EBE6DA", "#CFC5B0", "#8E9987", "#555E52"] },
  { name: "Solaris Amber", colors: ["#EFE6D5", "#E0B97C", "#C27D49", "#4A433D"] },
  { name: "Tate Slate", colors: ["#E4E2DD", "#B3B5B2", "#6F787D", "#9E7B66"] },
  { name: "Kodachrome Faded", colors: ["#EDE4D3", "#D4A88C", "#7F9196", "#B55D4C"] },
  { name: "Papyrus & Indigo", colors: ["#EAE3D2", "#C5BCA8", "#5E6E78", "#333F48"] },
];

export const COMPOSITION_COUNT = 5;

/** Avalanche-mixed FNV-1a, so similar strings give unrelated hashes. */
function hash(seedStr: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 13;
  h = Math.imul(h, 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}

/** One number from a stream unique to this seed and visual axis. */
function axisRandom(seed: string, axis: string): number {
  const h = (hash(`${seed}::${axis}`) + 0x6d2b79f5) >>> 0;
  let t = Math.imul(h ^ (h >>> 15), 1 | h);
  t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** The one pure entry point: a seed string in, cover params out. */
export function createCoverParams(seed: string): CoverParams {
  const r = (axis: string) => axisRandom(seed, axis);

  return {
    seed: Math.floor(r("phase") * 65535),
    palette: Math.floor(r("palette") * COVER_PALETTES.length),
    composition: Math.floor(r("composition") * COMPOSITION_COUNT),

    zoom: 0.75 + r("zoom") * 0.95,
    panX: (r("panX") - 0.5) * 0.5,
    panY: (r("panY") - 0.5) * 0.4,

    noiseScale: 0.9 + r("noise") * 2.4,
    warpStrength: 0.1 + r("warp") * 0.35,
    fieldBias: (r("fieldBias") - 0.5) * 0.3,

    grainStrength: 0.018 + r("grain") * 0.035,
    grainProfile: r("grainProfile"),

    lightX: r("lightX"),
    lightY: r("lightY"),
    lightStrength: 0.25 + r("lightStrength") * 0.95,
    vignette: 0.15 + r("vignette") * 0.8,
    accentStrength: 0.25 + r("accent") * 0.75,
    overprint: 0.3 + r("overprint") * 0.7,
    bandCount: 2 + Math.floor(r("bandCount") * 4),
    contrast: 0.82 + r("contrast") * 0.36,
  };
}

/** Used only when WebGL2 is unavailable, so cards never render empty. */
export function createCoverFallbackStyle(params: CoverParams) {
  const colors = COVER_PALETTES[params.palette % COVER_PALETTES.length].colors;
  const angle = Math.round(params.lightX * 360);

  return {
    backgroundColor: colors[3],
    backgroundImage: `linear-gradient(${angle}deg, ${colors[0]} 0%, ${colors[1]} 45%, ${colors[3]} 100%)`,
  };
}
