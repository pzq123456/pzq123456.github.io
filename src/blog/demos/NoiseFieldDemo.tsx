import { useEffect, useRef, useState } from "react";

const W = 560;
const H = 280;
const COLS = 96;
const ROWS = 48;

type RGB = [number, number, number];

const GRAD: [number, number, number][] = [
  [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
  [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
  [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
];

const fade = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function hash3(ix: number, iy: number, iz: number, seed: number) {
  let h =
    Math.imul(ix, 374761393) +
    Math.imul(iy, 668265263) +
    Math.imul(iz, 1442695041) +
    Math.imul(seed, 1597334677);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h = Math.imul(h ^ (h >>> 16), 2246822519);
  return (h ^ (h >>> 13)) >>> 0;
}

function noise3D(x: number, y: number, z: number, seed: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fy = y - iy;
  const fz = z - iz;
  const u = fade(fx);
  const v = fade(fy);
  const w = fade(fz);

  const corner = (ox: number, oy: number, oz: number) => {
    const g = GRAD[hash3(ix + ox, iy + oy, iz + oz, seed) % 12];
    return (
      g[0] * (fx - ox) + g[1] * (fy - oy) + g[2] * (fz - oz)
    );
  };

  const x00 = lerp(corner(0, 0, 0), corner(1, 0, 0), u);
  const x10 = lerp(corner(0, 1, 0), corner(1, 1, 0), u);
  const x01 = lerp(corner(0, 0, 1), corner(1, 0, 1), u);
  const x11 = lerp(corner(0, 1, 1), corner(1, 1, 1), u);

  return lerp(lerp(x00, x10, v), lerp(x01, x11, v), w) * 1.65;
}

function fbm3D(x: number, y: number, t: number, seed: number) {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;

  for (let o = 0; o < 3; o++) {
    sum += noise3D(x * freq, y * freq, t * freq, seed + o * 37) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2.02;
  }

  return sum / norm;
}

/** 与首页同源的简化高度场：域扭曲 + 高斯大陆 + 海岸噪声。 */
function elevation(nx: number, ny: number, t: number, seed: number) {
  const x0 = (nx - 0.5) * 2;
  const y0 = (ny - 0.5) * 2;

  const wx = x0 + fbm3D(x0 * 1.3, y0 * 1.3, t * 0.3, seed + 11) * 0.16;
  const wy = y0 + fbm3D(x0 * 1.3, y0 * 1.3, t * 0.3, seed + 29) * 0.16;

  const d2 = (wx / 0.62) ** 2 + (wy / 0.34) ** 2;
  const mask = Math.exp(-d2 * 1.25);
  const coast = fbm3D(wx * 2.1, wy * 2.1, t, seed + 61);

  return mask * 0.8 + coast * 0.3 - 0.42;
}

const parseRGB = (value: string, fallback: RGB): RGB => {
  const hex = value.trim().match(/^#([0-9a-f]{6})$/i);
  if (!hex) return fallback;
  const raw = hex[1];
  return [
    parseInt(raw.slice(0, 2), 16),
    parseInt(raw.slice(2, 4), 16),
    parseInt(raw.slice(4, 6), 16),
  ];
};

const mix = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

const css = (c: RGB, alpha = 1) =>
  `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${alpha})`;

export default function NoiseFieldDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState(0);
  const [seed, setSeed] = useState(2026);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const styles = getComputedStyle(canvas);
    const paper = parseRGB(
      styles.getPropertyValue("--bg-main"),
      [240, 238, 230],
    );
    const olive = parseRGB(
      styles.getPropertyValue("--brand-olive"),
      [120, 140, 93],
    );
    const blue = parseRGB(
      styles.getPropertyValue("--brand-blue"),
      [106, 155, 204],
    );
    const accent = parseRGB(
      styles.getPropertyValue("--brand-accent"),
      [193, 95, 60],
    );

    const shallow = mix(paper, blue, 0.55);
    const deep = mix(blue, paper, 0.55);
    const landLow = mix(paper, olive, 0.62);

    ctx.clearRect(0, 0, W, H);

    const cw = W / COLS;
    const ch = H / ROWS;

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const h = elevation(
          (col + 0.5) / COLS,
          (row + 0.5) / ROWS,
          time,
          seed,
        );

        let color: RGB;
        if (h < 0) {
          const depth = clamp01(-h / 0.45);
          color = mix(shallow, deep, depth);
        } else {
          const elev = clamp01(h / 0.7);
          color = mix(landLow, olive, elev * 0.7);
          if (elev > 0.78) {
            color = mix(color, accent, (elev - 0.78) / 0.22 * 0.6);
          }
        }

        ctx.fillStyle = css(color);
        ctx.fillRect(col * cw, row * ch, cw + 0.6, ch + 0.6);
      }
    }
  }, [time, seed]);

  useEffect(() => {
    if (!playing) return;

    const timer = window.setInterval(() => {
      setTime((current) => (current + 0.04) % 8);
    }, 90);

    return () => window.clearInterval(timer);
  }, [playing]);

  return (
    <div className="my-10 border border-line/70 bg-canvas-sub/50 p-4 font-sans md:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-coral">
          交互演示 · 同一套数学的最小实现
        </span>
        <span className="font-mono text-[12px] text-ink-muted">
          seed = {seed} · t = {time.toFixed(2)}
        </span>
      </div>

      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        role="img"
        aria-label="由三维噪声生成、随时间与种子变化的海陆高度场"
        className="mt-4 h-auto w-full border border-line/40"
      />

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted">
            时间坐标 t
            <output className="text-ink-bold">{time.toFixed(2)}</output>
          </span>
          <input
            type="range"
            min="0"
            max="8"
            step="0.02"
            value={time}
            onChange={(event) => setTime(Number(event.target.value))}
            className="h-1.5 w-full cursor-pointer"
            style={{ accentColor: "var(--brand-accent)" }}
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted">
            世界身份 seed
          </span>
          <div className="flex flex-wrap gap-2">
            {[2026, 7, 42, 8888].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setSeed(value)}
                className={`border px-2.5 py-1 font-mono text-[12px] transition-colors ${
                  seed === value
                    ? "border-accent bg-accent text-canvas"
                    : "border-line/70 text-ink-muted hover:border-accent hover:text-accent"
                }`}
              >
                {value}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPlaying((value) => !value)}
              className="border border-line/70 px-2.5 py-1 font-mono text-[12px] text-ink-muted transition-colors hover:border-accent hover:text-accent"
            >
              {playing ? "暂停" : "播放"}
            </button>
          </div>
        </div>
      </div>

      <p className="mt-4 font-mono text-[11px] leading-relaxed text-ink-faint">
        拖动时间：相邻时刻连续变化，但相隔一个整数格点后几乎无关。
        切换 seed：连大陆的位置和形状都会改变。
      </p>
    </div>
  );
}
