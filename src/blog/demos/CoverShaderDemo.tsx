import { useDeferredValue, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  COVER_PALETTES,
  createCoverFallbackStyle,
  createCoverParams,
  type CoverParams,
} from "@/utils/cover";
import { coverRenderer } from "@/utils/coverRenderer";

const DEFAULT_SEED = "2026-11-27-procedural-cover-shader";

const COMPOSITIONS = ["Horizon", "Diagonal", "Halo", "Strata", "Overprint"];

type SliderKey =
  | "zoom"
  | "panX"
  | "panY"
  | "noiseScale"
  | "warpStrength"
  | "grainStrength"
  | "contrast";

const SLIDERS: ReadonlyArray<{
  key: SliderKey;
  en: string;
  zh: string;
  min: number;
  max: number;
  step: number;
}> = [
  { key: "zoom", en: "Framing zoom", zh: "取景缩放", min: 0.75, max: 1.7, step: 0.01 },
  { key: "panX", en: "Pan X", zh: "横向取景", min: -0.25, max: 0.25, step: 0.01 },
  { key: "panY", en: "Pan Y", zh: "纵向取景", min: -0.2, max: 0.2, step: 0.01 },
  { key: "noiseScale", en: "FBM scale", zh: "噪声尺度", min: 0.6, max: 3.5, step: 0.05 },
  { key: "warpStrength", en: "Domain warp", zh: "域扭曲强度", min: 0, max: 0.55, step: 0.01 },
  { key: "grainStrength", en: "Paper grain", zh: "纸张颗粒", min: 0, max: 0.09, step: 0.002 },
  { key: "contrast", en: "Print contrast", zh: "印刷对比", min: 0.75, max: 1.35, step: 0.01 },
];

const controlLabel =
  "block font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted";

export default function CoverShaderDemo() {
  const { t } = useApp();
  const [seed, setSeed] = useState(DEFAULT_SEED);
  const [params, setParams] = useState<CoverParams>(() =>
    createCoverParams(DEFAULT_SEED),
  );

  // Keep the inputs responsive while the GPU redraws.
  const deferredParams = useDeferredValue(params);
  const image = useMemo(
    () => coverRenderer.render(deferredParams, 960, 600),
    [deferredParams],
  );
  const fallback = useMemo(
    () => createCoverFallbackStyle(deferredParams),
    [deferredParams],
  );
  // Four neighbouring seeds make the archetype diversity visible at a glance.
  const variants = useMemo(
    () =>
      Array.from({ length: 4 }, (_, index) => ({
        index,
        image: coverRenderer.render(
          createCoverParams(`${seed}::variant-${index}`),
          320,
          200,
        ),
      })),
    [seed],
  );

  function updateSeed(next: string) {
    setSeed(next);
    setParams(createCoverParams(next || "untitled"));
  }

  function randomize() {
    const next = `seed-${Math.random().toString(36).slice(2, 8)}`;
    updateSeed(next);
  }

  const palette = COVER_PALETTES[params.palette % COVER_PALETTES.length];
  const composition = COMPOSITIONS[params.composition % COMPOSITIONS.length];

  return (
    <div className="my-12">
      <div className="grid gap-6 md:grid-cols-[1.3fr_1fr] md:gap-8">
        <div>
          <div className="aspect-[16/10] w-full overflow-hidden rounded-lg bg-canvas-sub">
            {image ? (
              <img
                src={image}
                alt={t({ en: "Generated cover", zh: "生成的封面" })}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                style={fallback}
                className="flex h-full w-full items-center justify-center"
              >
                <span className="bg-canvas/70 px-3 py-1 font-mono text-[11px] text-ink-muted">
                  {t({
                    en: "WebGL2 unavailable — CSS fallback",
                    zh: "当前浏览器不支持 WebGL2，显示 CSS 兜底",
                  })}
                </span>
              </div>
            )}
          </div>
          <span className="mt-3 block font-mono text-[11px] text-ink-faint">
            {palette.name} / {composition} / #{params.seed}
          </span>
        </div>

        <div className="space-y-5">
          <div>
            <span className={controlLabel}>
              {t({ en: "Seed", zh: "种子" })}
            </span>
            <div className="mt-2 flex gap-2">
              <input
                value={seed}
                onChange={(event) => updateSeed(event.target.value)}
                spellCheck={false}
                className="min-w-0 flex-1 border border-line bg-canvas px-3 py-2 font-mono text-[12px] text-ink-base focus:outline-1 focus:outline-accent"
              />
              <button
                type="button"
                onClick={randomize}
                aria-label={t({ en: "Random seed", zh: "随机种子" })}
                title={t({ en: "Random seed", zh: "随机种子" })}
                className="border border-line px-3 font-mono text-[14px] text-ink-muted transition-colors hover:border-accent hover:text-accent"
              >
                ↻
              </button>
            </div>
          </div>

          <div>
            <span className={controlLabel}>
              {t({ en: "Ink palette", zh: "油墨配色" })}
            </span>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {COVER_PALETTES.map((item, index) => (
                <button
                  key={item.name}
                  type="button"
                  title={item.name}
                  aria-label={item.name}
                  aria-pressed={index === params.palette}
                  onClick={() =>
                    setParams((previous) => ({ ...previous, palette: index }))
                  }
                  style={{
                    backgroundImage: `linear-gradient(90deg, ${item.colors.join(", ")})`,
                  }}
                  className={`h-7 rounded-sm transition-opacity ${
                    index === params.palette
                      ? "ring-1 ring-accent ring-offset-1 ring-offset-canvas"
                      : "opacity-60 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <span className={controlLabel}>
              {t({ en: "Composition", zh: "构图" })}
            </span>
            <div className="mt-2 grid grid-cols-5 gap-1.5">
              {COMPOSITIONS.map((item, index) => (
                <button
                  key={item}
                  type="button"
                  title={item}
                  aria-label={item}
                  aria-pressed={index === params.composition}
                  onClick={() =>
                    setParams((previous) => ({
                      ...previous,
                      composition: index,
                    }))
                  }
                  className={`border py-2 font-mono text-[11px] transition-colors ${
                    index === params.composition
                      ? "border-accent text-accent"
                      : "border-line text-ink-muted hover:border-accent hover:text-accent"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {SLIDERS.map((slider) => (
              <label key={slider.key} className="block">
                <span className="flex items-baseline justify-between">
                  <span className={controlLabel}>
                    {t({ en: slider.en, zh: slider.zh })}
                  </span>
                  <span className="font-mono text-[11px] text-ink-muted">
                    {params[slider.key].toFixed(
                      slider.key === "grainStrength" ? 3 : 2,
                    )}
                  </span>
                </span>
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={params[slider.key]}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    setParams((previous) => ({ ...previous, [slider.key]: value }));
                  }}
                  className="mt-1.5 w-full accent-accent"
                />
              </label>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setParams(createCoverParams(seed))}
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent transition-colors hover:text-ink-bold"
          >
            {t({ en: "Reset to seed", zh: "恢复种子默认值" })}
          </button>
        </div>
      </div>

      <div className="mt-8">
        <span className={controlLabel}>
          {t({ en: "Nearby seeds", zh: "邻近种子" })}
        </span>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {variants.map((variant) =>
            variant.image ? (
              <div
                key={variant.index}
                className="aspect-[16/10] w-full overflow-hidden rounded-sm bg-canvas-sub"
              >
                <img
                  src={variant.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null,
          )}
        </div>
      </div>
    </div>
  );
}
