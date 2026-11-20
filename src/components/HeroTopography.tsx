
import { useEffect, useRef } from "react";

type Point = { x: number; y: number };

type Segment = {
  aId: number;
  bId: number;
  ax: number;
  ay: number;
  bx: number;
  by: number;
};

type ContourPath = {
  points: Point[];
  closed: boolean;
};

type RGB = [number, number, number];

export type HeroTopographyProps = {
  className?: string;
  accentColor?: string;
  accentWidth?: number;
  animate?: boolean;

  /** 世界身份：固定 Seed */
  seed?: number;

  /**
   * 时间戳，Unix milliseconds。
   * 不传则以组件初始化时的当前时间作为起点。
   */
  timestamp?: number;

  /**
   * 最快层（细节）的时间流速，单位：噪声时间坐标 / 秒。
   * 默认 1/60，即细节层约每 1 分钟经历一个噪声格点。
   */
  timeScale?: number;

  /**
   * 海岸层相对细节层的放慢倍数，默认 24（分钟 → 小时）。
   */
  coastSlowdown?: number;

  /**
   * 大陆层相对细节层的放慢倍数，默认 1440（分钟 → 天）。
   */
  macroSlowdown?: number;

  /**
   * 动画态下完整重绘的最小间隔（毫秒），默认 1000。
   * 3D 噪声单次重绘成本较高，低频重绘是主要的性能保障。
   */
  renderIntervalMs?: number;

  /**
   * 时间原点，Unix milliseconds。
   * 使用固定原点保证跨设备的时间坐标一致。
   */
  timeOrigin?: number;
};

const HERO_FADE =
  "linear-gradient(to bottom, transparent 0%, #000 6%, #000 62%, transparent 100%)";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const clampByte = (v: number) =>
  Math.max(0, Math.min(255, Math.round(v)));

const smoothstep = (t: number) => t * t * (3 - 2 * t);

const lerp = (a: number, b: number, t: number) =>
  a + (b - a) * t;

/**
 * 三维格点哈希。
 * 这里只负责决定格点上的梯度方向，
 * 不直接生成最终的连续噪声值。
 */
const hash3 = (
  ix: number,
  iy: number,
  iz: number,
  seed: number,
) => {
  let h =
    Math.imul(ix, 374761393) +
    Math.imul(iy, 668265263) +
    Math.imul(iz, 1442695041) +
    Math.imul(seed, 1597334677);

  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h = Math.imul(h ^ (h >>> 16), 2246822519);

  return (h ^ (h >>> 13)) >>> 0;
};

/**
 * 12 个经典三维梯度方向。
 * 每个格点的梯度由 Seed 和格点坐标确定。
 */
const GRAD3: [number, number, number][] = [
  [1, 1, 0],
  [-1, 1, 0],
  [1, -1, 0],
  [-1, -1, 0],
  [1, 0, 1],
  [-1, 0, 1],
  [1, 0, -1],
  [-1, 0, -1],
  [0, 1, 1],
  [0, -1, 1],
  [0, 1, -1],
  [0, -1, -1],
];

const grad3 = (
  ix: number,
  iy: number,
  iz: number,
  seed: number,
): [number, number, number] => {
  const h = hash3(ix, iy, iz, seed);
  const g = GRAD3[h % GRAD3.length];
  const inv = 1 / Math.SQRT2;

  return [g[0] * inv, g[1] * inv, g[2] * inv];
};

/**
 * 3D Gradient Noise。
 *
 * N(x, y, z, seed)
 *
 * x、y 是空间坐标。
 * z 是连续时间坐标。
 * seed 决定整个噪声场的身份。
 */
const noise3D = (
  x: number,
  y: number,
  z: number,
  seed: number,
) => {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);

  const fx = x - ix;
  const fy = y - iy;
  const fz = z - iz;

  const u = smoothstep(fx);
  const v = smoothstep(fy);
  const w = smoothstep(fz);

  const dot = (
    gx: number,
    gy: number,
    gz: number,
    dx: number,
    dy: number,
    dz: number,
  ) => gx * dx + gy * dy + gz * dz;

  const corner = (
    ox: number,
    oy: number,
    oz: number,
  ) => {
    const [gx, gy, gz] = grad3(
      ix + ox,
      iy + oy,
      iz + oz,
      seed,
    );

    return dot(
      gx,
      gy,
      gz,
      fx - ox,
      fy - oy,
      fz - oz,
    );
  };

  const n000 = corner(0, 0, 0);
  const n100 = corner(1, 0, 0);
  const n010 = corner(0, 1, 0);
  const n110 = corner(1, 1, 0);

  const n001 = corner(0, 0, 1);
  const n101 = corner(1, 0, 1);
  const n011 = corner(0, 1, 1);
  const n111 = corner(1, 1, 1);

  const x00 = lerp(n000, n100, u);
  const x10 = lerp(n010, n110, u);
  const x01 = lerp(n001, n101, u);
  const x11 = lerp(n011, n111, u);

  const y0 = lerp(x00, x10, v);
  const y1 = lerp(x01, x11, v);

  return lerp(y0, y1, w) * 1.65;
};

/**
 * 多尺度三维噪声。
 * 每一个 octave 都有独立的空间和时间频率。
 */
const fbm3D = (
  x: number,
  y: number,
  t: number,
  seed: number,
  octaves = 3,
) => {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;

  for (let i = 0; i < octaves; i++) {
    sum +=
      noise3D(
        x * freq,
        y * freq,
        t * freq,
        seed + i * 37,
      ) * amp;

    norm += amp;
    amp *= 0.5;
    freq *= 2.02;
  }

  return sum / norm;
};

/**
 * 山脊型噪声。
 * 用于构造山脉和高海拔地形。
 */
const ridgedFbm3D = (
  x: number,
  y: number,
  t: number,
  seed: number,
  octaves = 3,
) => {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  let weight = 1;
  let norm = 0;

  for (let i = 0; i < octaves; i++) {
    let n =
      1 -
      Math.abs(
        noise3D(
          x * freq,
          y * freq,
          t * freq,
          seed + i * 53,
        ),
      );

    n = n * n * weight;
    weight = clamp01(n * 1.6);

    sum += n * amp;
    norm += amp;

    amp *= 0.5;
    freq *= 2.05;
  }

  return sum / norm;
};

const parseColor = (
  value: string,
  fallback: RGB,
): RGB => {
  const hex = value.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);

  if (hex) {
    const raw = hex[1];
    const full =
      raw.length === 3
        ? raw.split("").map((c) => c + c).join("")
        : raw;

    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16),
    ];
  }

  const rgb = value.match(
    /rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/i,
  );

  return rgb
    ? [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])]
    : fallback;
};

const mix = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

const rgba = (c: RGB, alpha: number) =>
  `rgba(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])}, ${alpha})`;

const readPalette = (
  el: HTMLElement,
  accentOverride?: string,
) => {
  const styles = getComputedStyle(el);

  const get = (name: string, fallback: string) =>
    styles.getPropertyValue(name).trim() || fallback;

  const dark =
    document.documentElement.classList.contains("dark");

  const paper = parseColor(
    get("--bg-main", dark ? "#181a18" : "#f3efe6"),
    [243, 239, 230],
  );

  const olive = parseColor(
    get("--brand-olive", "#6f8558"),
    [111, 133, 88],
  );

  const blue = parseColor(
    get("--brand-blue", "#4b83b8"),
    [75, 131, 184],
  );

  const accent = accentOverride
    ? parseColor(accentOverride, [214, 98, 56])
    : parseColor(
        get("--brand-accent", "#c85a32"),
        [200, 90, 50],
      );

  const inkBlue = mix(mix(blue, paper, 0.16), olive, 0.2);

  const deepTone = mix(
    paper,
    [26, 30, 36],
    dark ? 0.86 : 0.74,
  );

  // 海陆色带：保留墨蓝 / 暖岩的身份，但减少纸色稀释、拉开相邻色阶，
  // 让色带更饱满，不再整体发灰发淡。
  const seaShallow = mix(paper, inkBlue, dark ? 0.48 : 0.42);

  return {
    dark,
    accent,
    // 海洋三段：纸蓝 → 中蓝 → 暖炭灰蓝
    seaShallow,
    seaMid: mix(seaShallow, inkBlue, 0.6),
    seaDeep: mix(inkBlue, deepTone, dark ? 0.42 : 0.38),
    // 陆地四段：砂橄榄 → 橄榄 → 暖岩 → 陶土高点
    landLow: mix(paper, olive, dark ? 0.28 : 0.26),
    landMid: mix(olive, paper, dark ? 0.18 : 0.12),
    landHigh: mix(olive, accent, dark ? 0.3 : 0.26),
    landPeak: mix(accent, paper, dark ? 0.2 : 0.18),
    seaLine: mix(inkBlue, olive, 0.4),
    coastLine: mix(inkBlue, accent, 0.3),
    landLine: mix(
      olive,
      dark ? [220, 224, 214] : [58, 72, 46],
      0.35,
    ),
  };
};

/** 由 seed 派生的宏观形态：让不同世界的大陆位置与轮廓真正不同。 */
type TerrainShape = {
  cx: number;
  cy: number;
  cos: number;
  sin: number;
  span: number;
  islandA: number;
  islandB: number;
};

const seedUnit = (seed: number, n: number) =>
  hash3(n, 17, 31, seed) / 4294967296;

const makeTerrainShape = (seed: number): TerrainShape => {
  const angle = (seedUnit(seed, 3) - 0.5) * 0.6;

  return {
    cx: 0.52 + seedUnit(seed, 1) * 0.12,
    cy: 0.4 + seedUnit(seed, 2) * 0.12,
    cos: Math.cos(angle),
    sin: Math.sin(angle),
    span: 0.38 + seedUnit(seed, 4) * 0.08,
    islandA: 0.78 + seedUnit(seed, 5) * 0.12,
    islandB: 0.6 + seedUnit(seed, 6) * 0.12,
  };
};

/**
 * 时间连续的地形采样。
 *
 * 三层使用各自的时间坐标：
 * 大陆轮廓 macroTime（默认按天）、海岸线 coastTime（按小时）、
 * 山脊细节 detailTime（按分钟）。
 */
const sampleElevation = (
  nx: number,
  ny: number,
  aspect: number,
  seed: number,
  macroTime: number,
  coastTime: number,
  detailTime: number,
  shape: TerrainShape,
) => {
  const dx0 = (nx - shape.cx) * aspect;
  const dy0 = ny - shape.cy;

  const rx0 = dx0 * shape.cos - dy0 * shape.sin;
  const ry0 = dx0 * shape.sin + dy0 * shape.cos;

  // 大陆轮廓：按天变化
  const warpX =
    fbm3D(
      rx0 * 1.15,
      ry0 * 1.15,
      macroTime,
      seed + 11,
      2,
    ) * 0.14;

  const warpY =
    fbm3D(
      rx0 * 1.15,
      ry0 * 1.15,
      macroTime,
      seed + 29,
      2,
    ) * 0.12;

  const wx = rx0 + warpX;
  const wy = ry0 + warpY;

  const spanX = Math.max(0.55, aspect * shape.span);

  const mainDist2 =
    (wx / spanX) ** 2 +
    (wy / 0.34) ** 2;

  const mainMask = Math.exp(-mainDist2 * 1.25);

  const isl1Dist2 =
    ((wx + spanX * shape.islandA) / 0.14) ** 2 +
    ((wy + 0.14) / 0.09) ** 2;

  const isl2Dist2 =
    ((wx + spanX * shape.islandB) / 0.1) ** 2 +
    ((wy - 0.18) / 0.075) ** 2;

  const islands =
    Math.exp(-isl1Dist2 * 1.8) * 0.34 +
    Math.exp(-isl2Dist2 * 2.0) * 0.26;

  // 海岸线：按小时变化
  const coastNoise = fbm3D(
    wx * 1.85 + 3.1,
    wy * 1.85 + 1.4,
    coastTime,
    seed + 61,
    3,
  );

  // 山脊细节：按分钟变化
  const ridge = ridgedFbm3D(
    wx * 2.3,
    wy * 2.3,
    detailTime,
    seed + 89,
    3,
  );

  const landBase =
    mainMask * 0.68 +
    islands +
    coastNoise * 0.24 -
    0.34;

  const mountainBoost =
    clamp01((landBase + 0.12) * 1.8) *
    ridge *
    0.28;

  return landBase + mountainBoost;
};

const interp = (
  a: number,
  b: number,
  level: number,
) => {
  const d = b - a;

  return Math.abs(d) < 1e-7
    ? 0.5
    : clamp01((level - a) / d);
};

const extractSegments = (
  values: Float32Array,
  cols: number,
  rows: number,
  level: number,
): Segment[] => {
  const segs: Segment[] = [];
  const stride = cols * rows;

  for (let y = 0; y < rows - 1; y++) {
    const rowOff = y * cols;
    const nextRowOff = (y + 1) * cols;

    for (let x = 0; x < cols - 1; x++) {
      const i = rowOff + x;

      const a = values[i];
      const b = values[i + 1];
      const c = values[nextRowOff + x + 1];
      const d = values[nextRowOff + x];

      const mask =
        (a >= level ? 1 : 0) |
        (b >= level ? 2 : 0) |
        (c >= level ? 4 : 0) |
        (d >= level ? 8 : 0);

      if (mask === 0 || mask === 15) continue;

      const top = {
        x: x + interp(a, b, level),
        y,
      };

      const right = {
        x: x + 1,
        y: y + interp(b, c, level),
      };

      const bottom = {
        x: x + interp(d, c, level),
        y: y + 1,
      };

      const left = {
        x,
        y: y + interp(a, d, level),
      };

      const topId = i;
      const rightId = stride + i + 1;
      const bottomId = nextRowOff + x;
      const leftId = stride + i;

      const push = (
        aId: number,
        p1: Point,
        bId: number,
        p2: Point,
      ) => {
        segs.push({
          aId,
          bId,
          ax: p1.x,
          ay: p1.y,
          bx: p2.x,
          by: p2.y,
        });
      };

      switch (mask) {
        case 1:
          push(leftId, left, topId, top);
          break;
        case 2:
          push(topId, top, rightId, right);
          break;
        case 3:
          push(leftId, left, rightId, right);
          break;
        case 4:
          push(rightId, right, bottomId, bottom);
          break;
        case 5:
          if ((a + b + c + d) * 0.25 >= level) {
            push(topId, top, rightId, right);
            push(bottomId, bottom, leftId, left);
          } else {
            push(leftId, left, topId, top);
            push(rightId, right, bottomId, bottom);
          }
          break;
        case 6:
          push(topId, top, bottomId, bottom);
          break;
        case 7:
          push(bottomId, bottom, leftId, left);
          break;
        case 8:
          push(bottomId, bottom, leftId, left);
          break;
        case 9:
          push(topId, top, bottomId, bottom);
          break;
        case 10:
          if ((a + b + c + d) * 0.25 >= level) {
            push(leftId, left, topId, top);
            push(rightId, right, bottomId, bottom);
          } else {
            push(topId, top, rightId, right);
            push(bottomId, bottom, leftId, left);
          }
          break;
        case 11:
          push(rightId, right, bottomId, bottom);
          break;
        case 12:
          push(leftId, left, rightId, right);
          break;
        case 13:
          push(topId, top, rightId, right);
          break;
        case 14:
          push(leftId, left, topId, top);
          break;
      }
    }
  }

  return segs;
};

const stitchAndSmooth = (
  segs: Segment[],
  stepX: number,
  stepY: number,
): ContourPath[] => {
  const adj = new Map<number, number[]>();

  for (let idx = 0; idx < segs.length; idx++) {
    const s = segs[idx];

    let la = adj.get(s.aId);
    if (!la) adj.set(s.aId, (la = []));
    la.push(idx);

    let lb = adj.get(s.bId);
    if (!lb) adj.set(s.bId, (lb = []));
    lb.push(idx);
  }

  const visited = new Uint8Array(segs.length);
  const paths: ContourPath[] = [];

  for (let start = 0; start < segs.length; start++) {
    if (visited[start]) continue;

    visited[start] = 1;

    const first = segs[start];

    const pts: Point[] = [
      { x: first.ax * stepX, y: first.ay * stepY },
      { x: first.bx * stepX, y: first.by * stepY },
    ];

    const rootId = first.aId;
    let currId = first.bId;
    let closed = false;

    while (true) {
      const candidates = adj.get(currId);
      let nextIdx: number | undefined;

      if (candidates) {
        for (let k = 0; k < candidates.length; k++) {
          const cIdx = candidates[k];

          if (!visited[cIdx]) {
            nextIdx = cIdx;
            break;
          }
        }
      }

      if (nextIdx === undefined) break;

      visited[nextIdx] = 1;

      const seg = segs[nextIdx];
      const toB = seg.aId === currId;

      pts.push({
        x: (toB ? seg.bx : seg.ax) * stepX,
        y: (toB ? seg.by : seg.ay) * stepY,
      });

      currId = toB ? seg.bId : seg.aId;

      if (currId === rootId) {
        closed = true;
        break;
      }
    }

    if (closed && pts.length > 1) pts.pop();

    let len = 0;

    for (let i = 1; i < pts.length; i++) {
      len += Math.hypot(
        pts[i].x - pts[i - 1].x,
        pts[i].y - pts[i - 1].y,
      );
    }

    if (pts.length < 3 || len < 28) continue;

    let curr = pts;

    for (let pass = 0; pass < 2; pass++) {
      const next: Point[] = [];
      const n = curr.length;
      const count = closed ? n : n - 1;

      if (!closed) next.push(curr[0]);

      for (let i = 0; i < count; i++) {
        const p0 = curr[i];
        const p1 = curr[(i + 1) % n];

        next.push({
          x: p0.x * 0.75 + p1.x * 0.25,
          y: p0.y * 0.75 + p1.y * 0.25,
        });

        next.push({
          x: p0.x * 0.25 + p1.x * 0.75,
          y: p0.y * 0.25 + p1.y * 0.75,
        });
      }

      if (!closed) next.push(curr[n - 1]);

      curr = next;
    }

    paths.push({ points: curr, closed });
  }

  return paths;
};

const createGrainPattern = (
  ctx: CanvasRenderingContext2D,
  seed: number,
  dark: boolean,
) => {
  const size = 160;
  const tile = document.createElement("canvas");

  tile.width = size;
  tile.height = size;

  const tctx = tile.getContext("2d");
  if (!tctx) return null;

  const img = tctx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let h =
        Math.imul(x, 374761393) +
        Math.imul(y, 668265263) +
        Math.imul(seed + 307, 1442695041);

      h = Math.imul(h ^ (h >>> 13), 1274126177);

      const v = ((h ^ (h >>> 16)) >>> 0) / 4294967296;
      const idx = (y * size + x) * 4;
      const light = v >= 0.5;

      img.data[idx] = light ? (dark ? 225 : 255) : dark ? 15 : 40;
      img.data[idx + 1] = light ? (dark ? 225 : 250) : dark ? 18 : 36;
      img.data[idx + 2] = light ? (dark ? 220 : 240) : dark ? 24 : 32;
      img.data[idx + 3] = Math.round(Math.abs(v - 0.5) * 32);
    }
  }

  tctx.putImageData(img, 0, 0);

  return ctx.createPattern(tile, "repeat");
};

export default function HeroTopography({
  className = "",
  accentColor,
  accentWidth = 2.4,
  animate = true,
  seed = 2026,
  timestamp,
  // 细节层约 1 分钟一个噪声格点；海岸 / 大陆分别再放慢 24 / 1440 倍
  timeScale = 1 / 60,
  coastSlowdown = 24,
  macroSlowdown = 1440,
  // 3D 噪声重绘成本高，默认 1 秒一次，兼顾连续感与性能
  renderIntervalMs = 1000,
  timeOrigin = 0,
}: HeroTopographyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reliefCanvas = document.createElement("canvas");
    const reliefCtx = reliefCanvas.getContext("2d");
    if (!reliefCtx) return;

    let palette = readPalette(canvas, accentColor);

    let grainPattern = createGrainPattern(
      ctx,
      seed,
      palette.dark,
    );

    let grainDark: boolean | null = palette.dark;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let cols = 0;
    let rows = 0;
    let stepX = 1;
    let stepY = 1;
    let aspect = 1;

    let nxTable = new Float32Array(0);
    let nyTable = new Float32Array(0);
    let values = new Float32Array(0);
    let reliefImage: ImageData | null = null;

    let isVisible = true;

    // 固定时间起点。
    // 相同 timestamp 在不同设备上会映射到相同时间坐标。
    const baseTimestamp = timestamp ?? Date.now();

    const refreshPaletteAndGrain = () => {
      palette = readPalette(canvas, accentColor);

      if (!grainPattern || grainDark !== palette.dark) {
        grainDark = palette.dark;
        grainPattern = createGrainPattern(
          ctx,
          seed,
          palette.dark,
        );
      }
    };

    const syncSize = () => {
      const rect = canvas.getBoundingClientRect();

      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));

      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      const cellPx = animate ? 10 : 8;

      cols = Math.min(
        160,
        Math.max(64, Math.round(width / cellPx)),
      );

      rows = Math.min(
        120,
        Math.max(48, Math.round(height / cellPx)),
      );

      stepX = width / (cols - 1);
      stepY = height / (rows - 1);
      aspect = width / height;

      nxTable = new Float32Array(cols);

      for (let x = 0; x < cols; x++) {
        nxTable[x] = x / (cols - 1);
      }

      nyTable = new Float32Array(rows);

      for (let y = 0; y < rows; y++) {
        nyTable[y] = y / (rows - 1);
      }

      values = new Float32Array(cols * rows);

      reliefCanvas.width = cols;
      reliefCanvas.height = rows;

      reliefImage = reliefCtx.createImageData(cols, rows);
    };

    const render = (elapsedSec: number) => {
      if (width <= 1 || height <= 1 || !reliefImage) return;

      /**
       * 三个视觉层各自的时间坐标（噪声单位）：
       * 细节按分钟、海岸按小时、大陆按天。
       * animate=false 时 elapsed 恒为 0，精确渲染 timestamp 对应的历史状态。
       */
      const timestampNow =
        baseTimestamp + elapsedSec * 1000;

      const seconds =
        (timestampNow - timeOrigin) / 1000;

      // 细节层最快；其余两层按比例放慢，形成多尺度时间语言。
      // 用 Math.max 兜底，避免 0 / 负数导致除零或时间倒流。
      const detailTime = seconds * timeScale;
      const coastTime =
        detailTime / Math.max(1, coastSlowdown);
      const macroTime =
        detailTime / Math.max(1, macroSlowdown);

      const shape = makeTerrainShape(seed);

      let minV = -0.02;
      let maxV = 0.02;

      // 1. 采样三维连续噪声场
      for (let y = 0; y < rows; y++) {
        const ny = nyTable[y];
        const rowOff = y * cols;

        for (let x = 0; x < cols; x++) {
          const v = sampleElevation(
            nxTable[x],
            ny,
            aspect,
            seed,
            macroTime,
            coastTime,
            detailTime,
            shape,
          );

          values[rowOff + x] = v;

          if (v < minV) minV = v;
          if (v > maxV) maxV = v;
        }
      }

      // 2. 地形着色和阴影
      const px = reliefImage.data;

      for (let y = 0; y < rows; y++) {
        const rowOff = y * cols;

        const prevRow = Math.max(0, y - 1) * cols;
        const nextRow = Math.min(rows - 1, y + 1) * cols;

        for (let x = 0; x < cols; x++) {
          const i = rowOff + x;
          const h = values[i];

          const hx =
            values[rowOff + Math.min(cols - 1, x + 1)] -
            values[rowOff + Math.max(0, x - 1)];

          const hy =
            values[nextRow + x] -
            values[prevRow + x];

          const shade = (-hx * 0.65 - hy * 0.75) * 46;

          let color: RGB;
          let alpha: number;
          let shadeFactor: number;

          if (h < 0) {
            const depth = clamp01(
              Math.abs(h) / Math.abs(minV),
            );

            // 三段海带：浅滩 → 中水道 → 深海
            color =
              depth < 0.45
                ? mix(
                    palette.seaShallow,
                    palette.seaMid,
                    depth / 0.45,
                  )
                : mix(
                    palette.seaMid,
                    palette.seaDeep,
                    (depth - 0.45) / 0.55,
                  );

            alpha =
              (palette.dark ? 0.26 : 0.3) +
              depth * 0.24;

            shadeFactor = 0.35;
          } else {
            const elev = clamp01(h / maxV);

            // 四段陆带：低地 → 丘陵 → 高地 → 陶土色山峰
            color =
              elev < 0.4
                ? mix(
                    palette.landLow,
                    palette.landMid,
                    elev / 0.4,
                  )
                : elev < 0.75
                  ? mix(
                      palette.landMid,
                      palette.landHigh,
                      (elev - 0.4) / 0.35,
                    )
                  : mix(
                      palette.landHigh,
                      palette.landPeak,
                      (elev - 0.75) / 0.25,
                    );

            alpha =
              (palette.dark ? 0.38 : 0.42) +
              elev * 0.28;

            shadeFactor = 1.05;
          }

          const o = i * 4;

          px[o] = clampByte(color[0] + shade * shadeFactor);
          px[o + 1] = clampByte(color[1] + shade * shadeFactor);
          px[o + 2] = clampByte(color[2] + shade * shadeFactor);
          px[o + 3] = clampByte(clamp01(alpha) * 255);
        }
      }

      reliefCtx.putImageData(reliefImage, 0, 0);

      // 3. 绘制地形
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(reliefCanvas, 0, 0, width, height);

      const seaLevels = 5;
      const landLevels = 10;
      const accentIdx = 6;
      const alphaScale = palette.dark ? 0.88 : 1;

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 4. Marching Squares 等高线提取
      const strokeLevel = (
        level: number,
        strokeStyle: string,
        lineWidth: number,
      ) => {
        const segs = extractSegments(
          values,
          cols,
          rows,
          level,
        );

        if (!segs.length) return;

        const paths = stitchAndSmooth(
          segs,
          stepX,
          stepY,
        );

        if (!paths.length) return;

        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();

        for (let pIdx = 0; pIdx < paths.length; pIdx++) {
          const p = paths[pIdx];
          const pts = p.points;

          if (pts.length === 0) continue;

          ctx.moveTo(pts[0].x, pts[0].y);

          for (let idx = 1; idx < pts.length; idx++) {
            ctx.lineTo(pts[idx].x, pts[idx].y);
          }

          if (p.closed) ctx.closePath();
        }

        ctx.stroke();
      };

      // 5. 海洋等高线
      for (let i = seaLevels; i >= 1; i--) {
        const major = i % 2 === 0;

        strokeLevel(
          minV * (i / (seaLevels + 1)),
          rgba(
            palette.seaLine,
            (major ? 0.4 : 0.2) * alphaScale,
          ),
          major ? 1.1 : 0.68,
        );
      }

      // 6. 海岸线
      strokeLevel(
        0,
        rgba(palette.coastLine, 0.65 * alphaScale),
        1.45,
      );

      // 7. 陆地等高线
      for (let i = 1; i <= landLevels; i++) {
        const isAccent = i === accentIdx;
        const major = i % 3 === 0;

        strokeLevel(
          maxV * (i / (landLevels + 1)),
          isAccent
            ? rgba(palette.accent, 0.92 * alphaScale)
            : rgba(
                palette.landLine,
                (major ? 0.5 : 0.25) * alphaScale,
              ),
          isAccent
            ? accentWidth
            : major
              ? 1.2
              : 0.7,
        );
      }

      // 8. 颗粒纹理
      if (grainPattern) {
        ctx.fillStyle = grainPattern;
        ctx.fillRect(0, 0, width, height);
      }
    };

    syncSize();

    let elapsed = 0;

    // 首次渲染
    render(elapsed);

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const shouldAnimate = animate && !prefersReduced;

    let raf = 0;
    let lastTick = 0;
    let lastRender = 0;

    // 3D 噪声单次采样远贵于 2D，15fps 全量重算属于算力与收益错配。
    // 多尺度时间下细节层也已经放慢到分钟级，1 秒一次足够连续。
    const frameInterval = Math.max(16, renderIntervalMs);

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);

      if (document.hidden || !isVisible) {
        lastTick = now;
        return;
      }

      if (lastTick === 0) lastTick = now;

      const dt = Math.min(
        0.25,
        (now - lastTick) / 1000,
      );

      lastTick = now;
      elapsed += dt;

      if (now - lastRender >= frameInterval) {
        lastRender = now;
        render(elapsed);
      }
    };

    if (shouldAnimate) {
      raf = requestAnimationFrame(loop);
    }

    // 可视区域检测
    const io = new IntersectionObserver(
      (entries) => {
        isVisible =
          entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0 },
    );

    io.observe(canvas);

    // 尺寸变化
    const onResize = () => {
      syncSize();
      render(elapsed);
    };

    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);

    // 主题变化
    const onThemeChange = () => {
      refreshPaletteAndGrain();
      render(elapsed);
    };

    const mo = new MutationObserver(onThemeChange);

    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      if (raf) cancelAnimationFrame(raf);

      io.disconnect();
      ro.disconnect();
      mo.disconnect();
    };
  }, [
    accentColor,
    accentWidth,
    animate,
    seed,
    timestamp,
    timeScale,
    coastSlowdown,
    macroSlowdown,
    renderIntervalMs,
    timeOrigin,
  ]);

  return (
    <div
      aria-hidden="true"
      style={{
        maskImage: HERO_FADE,
        WebkitMaskImage: HERO_FADE,
      }}
      className={`pointer-events-none absolute -top-16 bottom-0 left-1/2 z-0 w-screen -translate-x-1/2 overflow-hidden select-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
      />
    </div>
  );
}
