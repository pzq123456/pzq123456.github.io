import { useRef, useState, type MouseEvent } from "react";
import { ArrowUp, ArrowUpRight, Download, Github } from "lucide-react";
import WorldMapMatrix from "../WorldMapMatrix";
import RevealEmail from "../RevealEmail";
import { PERSONAL_INFO } from "@/data/portfolio.generated";
import { downloadWorldMapBenchmark } from "@/utils/worldBenchmark";
import { useApp } from "@/context/AppContext";

type City = "HONG_KONG" | "QINGDAO" | null;

const CITY_INFO = {
  HONG_KONG: { label: "Hong Kong", coords: "22°18′N 114°10′E" },
  QINGDAO: { label: "Qingdao", coords: "36°06′N 120°18′E" },
};

const SOURCE = {
  en: "A 128 × 64 land–ocean matrix generated in Google Earth Engine from remote-sensing imagery and a custom classification script. 1 = land, 0 = ocean.",
  zh: "在 Google Earth Engine 中用遥感影像和自定义分类脚本生成的 128 × 64 陆地—海洋矩阵。1 为陆地，0 为海洋。",
};

export default function Footer() {
  const { t, lang } = useApp();
  const { github } = PERSONAL_INFO.contact;

  const mapRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [city, setCity] = useState<City>(null);
  const [tip, setTip] = useState({ x: 16, y: 16 });

  const onMapMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTip({
      x: Math.max(
        16,
        Math.min(event.clientX - rect.left + 16, rect.width - 276),
      ),
      y: Math.max(
        16,
        Math.min(event.clientY - rect.top + 16, rect.height - 158),
      ),
    });
  };

  return (
    <footer
      id="contact"
      className="relative overflow-visible border-t border-line/30 py-12 text-ink-base transition-colors duration-300 md:py-16"
    >
      <div className="relative z-10 mx-auto w-full max-w-6xl px-8 md:px-16">
        <h2 className="mt-5 font-serif text-[28px] font-medium tracking-tight text-ink-bold md:text-[34px]">
          {t({ en: "A little perspective.", zh: "一点全球视角。" })}
        </h2>

        <div
          id="world"
          ref={mapRef}
          className="relative mx-auto mt-6 aspect-2/1 w-full max-w-250 overflow-hidden"
          onMouseMove={onMapMove}
          onMouseLeave={() => setHovered(false)}
        >
          <WorldMapMatrix onHoverChange={setHovered} onHoverCity={setCity} />

          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-line/20" />
            <div className="absolute bottom-0 left-1/2 top-0 border-l border-dashed border-line/20" />
          </div>

          {hovered && (
            <div
              className="pointer-events-none absolute z-20 w-65 border border-line/40 bg-canvas/95 p-3 shadow-lg backdrop-blur-sm"
              style={{ left: tip.x, top: tip.y }}
            >
              <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-coral">
                {city
                  ? CITY_INFO[city].label
                  : t({ en: "Land–ocean matrix", zh: "陆地—海洋矩阵" })}
              </p>
              {city ? (
                <p className="mt-1 font-mono text-[12px] text-blue">
                  {CITY_INFO[city].coords}
                </p>
              ) : null}
              <p className="mt-2 text-[13px] leading-relaxed text-ink-base">
                {t(SOURCE)}
              </p>
            </div>
          )}
        </div>

        <div className="mx-auto mt-4 flex max-w-250 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] leading-relaxed text-ink-muted">
            <span className="text-ink-bold">World map benchmark.</span> 128 × 64
            · Google Earth Engine · remote sensing
          </p>
          <button
            type="button"
            onClick={downloadWorldMapBenchmark}
            className="flex shrink-0 items-center gap-1.5 self-start text-[13px] font-medium text-ink-muted transition-colors hover:text-coral sm:self-center"
          >
            <Download size={13} />
            {t({ en: "Download prompt", zh: "下载提示词" })}
          </button>
        </div>

        <div className="mt-14 grid gap-8 border-t border-line/30 pt-8 md:grid-cols-12">
          <div className="md:col-span-7">
            <h2 className="font-display text-[48px] leading-none tracking-tight text-ink-bold md:text-[64px]">
              {lang === "zh" ? "聊聊。" : "Let's talk."}
            </h2>
            <div className="mt-5">
              <RevealEmail />
            </div>
          </div>

          <div className="flex flex-col items-start gap-4 font-mono text-[14px] text-ink-muted md:col-span-5 md:items-end">
            <a
              href={`https://github.com/${github}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 transition-colors hover:text-coral"
            >
              <Github size={15} className="text-coral/80" />
              github.com/{github}
              <ArrowUpRight size={13} />
            </a>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-line/20 pt-5 font-mono text-[12px] text-ink-muted">
          <span>© 2026 Pan Zhiqing</span>
          <a
            href="#about"
            className="flex items-center gap-1.5 transition-colors hover:text-coral"
          >
            {t({ en: "Back to top", zh: "回到顶部" })}
            <ArrowUp size={12} />
          </a>
        </div>
      </div>
    </footer>
  );
}
