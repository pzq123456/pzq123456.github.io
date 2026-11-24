import { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Chapter } from "../Chapter";
import { useApp } from "@/context/AppContext";

type Lang = "en" | "zh";

// Both languages are rendered up front (fullstack-<lang>.pdf / preview).
// These cards only decide which pre-rendered document sits on top.
const LANGS: {
  id: Lang;
  label: { en: string; zh: string };
}[] = [
  { id: "en", label: { en: "English", zh: "英文" } },
  { id: "zh", label: { en: "Chinese", zh: "中文" } },
];

const GHOST_CARDS = [
  {
    rest: "translate3d(20px, 12px, 0) rotate(4.2deg) scale(0.965)",
    hover: "translate3d(32px, 18px, 0) rotate(6.8deg) scale(0.96)",
    opacity: "opacity-55",
  },
  {
    rest: "translate3d(26px, 16px, 0) rotate(6deg) scale(0.95)",
    hover: "translate3d(42px, 24px, 0) rotate(9.2deg) scale(0.945)",
    opacity: "opacity-40",
  },
  {
    rest: "translate3d(32px, 20px, 0) rotate(7.8deg) scale(0.935)",
    hover: "translate3d(52px, 30px, 0) rotate(11.5deg) scale(0.93)",
    opacity: "opacity-25",
  },
];

export default function CvWorkspace() {
  const { t, lang } = useApp();

  // `lang` (site) is the external input the resume follows by default.
  // `manualLang` is local: only a manual card switch writes it, so switching
  // the resume never changes the site language.
  //
  // React's documented pattern for adjusting state when a prop changes: detect
  // the change during render and drop the override. Unlike `key` or an effect,
  // this keeps the DOM mounted, so the CSS card-rotation transition still runs
  // when the site language changes.
  const [seenSiteLang, setSeenSiteLang] = useState<Lang>(lang);
  const [manualLang, setManualLang] = useState<Lang | null>(null);

  if (lang !== seenSiteLang) {
    setSeenSiteLang(lang);
    setManualLang(null);
  }

  const activeLang = manualLang ?? lang;

  const [brokenSrcs, setBrokenSrcs] = useState<Record<string, boolean>>({});
  const [hovered, setHovered] = useState(false);

  // 实时拖拽手感状态
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const movedDuringDrag = useRef(false);

  const cycleLang = (dir: 1 | -1 = 1) => {
    const idx = LANGS.findIndex((v) => v.id === activeLang);
    const nextIdx = (idx + dir + LANGS.length) % LANGS.length;
    setManualLang(LANGS[nextIdx].id);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // 如果点在 <a> 链接上，不劫持手势
    if ((e.target as HTMLElement).closest("a")) return;
    dragStartX.current = e.clientX;
    movedDuringDrag.current = false;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || dragStartX.current === null) return;
    const delta = e.clientX - dragStartX.current;
    if (Math.abs(delta) > 6) {
      movedDuringDrag.current = true;
    }
    // 阻尼感：越往外拉阻力越大
    const damped = Math.sign(delta) * Math.pow(Math.abs(delta), 0.88);
    setDragX(damped);
  };

  const finishDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    const threshold = 52;
    if (Math.abs(dragX) > threshold) {
      cycleLang(dragX < 0 ? 1 : -1);
    }

    dragStartX.current = null;
    setDragX(0);
  };

  return (
    <Chapter
      title={t({ en: "CV", zh: "简历" })}
      id="cv"
      tone="muted"
      index="05"
      display="DOCUMENT"
    >
      <div className="flex flex-col items-center py-3">
        <div
          className="relative aspect-210/297 w-full max-w-[320px] touch-pan-y select-none sm:max-w-93.75"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => {
            setHovered(false);
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
        >
          {/* 假灰色底牌堆：增加纸叠厚度感 */}
          {GHOST_CARDS.map((ghost, idx) => (
            <div
              key={idx}
              aria-hidden="true"
              style={{
                transform: hovered ? ghost.hover : ghost.rest,
                zIndex: 5 - idx,
              }}
              className={`pointer-events-none absolute inset-0 rounded-2xl border border-ink-muted/25 bg-ink-muted/10 backdrop-blur-[1px] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${ghost.opacity}`}
            />
          ))}

          {/* 中英两份简历叠放卡组 */}
          {LANGS.map((item) => {
            const isActive = item.id === activeLang;
            const previewSrc = `/cv/preview_fullstack-${item.id}.webp`;
            const pdfHref = `/cv/fullstack-${item.id}.pdf`;
            const isBroken = brokenSrcs[previewSrc];

            const dragTilt = isActive ? dragX * 0.045 : 0;
            const dragLiftY = isActive ? -Math.abs(dragX) * 0.06 : 0;

            const transform = isActive
              ? `translate3d(${dragX}px, ${dragLiftY + (hovered && !isDragging ? -3 : 0)}px, 0) rotate(${dragTilt + (hovered && !isDragging ? -0.8 : 0)}deg)`
              : hovered
                ? "translate3d(18px, 11px, 0) rotate(4deg)"
                : "translate3d(11px, 7px, 0) rotate(2.5deg)";

            const handleSelectThisCard = () => {
              if (movedDuringDrag.current) {
                movedDuringDrag.current = false;
                return;
              }
              if (!isActive) {
                setManualLang(item.id);
              }
            };

            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                aria-pressed={isActive}
                aria-label={t(item.label)}
                onClick={handleSelectThisCard}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && !isActive) {
                    e.preventDefault();
                    setManualLang(item.id);
                  }
                }}
                style={{
                  transform,
                  zIndex: isActive ? 20 : 10,
                }}
                className={`group absolute inset-0 overflow-hidden rounded-2xl border-2 border-accent bg-canvas/80 p-2 backdrop-blur-xs ${
                  isDragging
                    ? "cursor-grabbing transition-none"
                    : "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                } ${
                  isActive
                    ? "cursor-grab opacity-100 ring-2 ring-accent/35 shadow-[0_24px_48px_-14px_rgba(0,0,0,0.24)] active:cursor-grabbing"
                    : "cursor-pointer brightness-75 contrast-90 opacity-65 shadow-md hover:brightness-90 hover:opacity-85"
                }`}
              >
                <div className="relative h-full w-full overflow-hidden rounded-xl bg-canvas">
                  {isBroken ? (
                    <div className="flex h-full items-center justify-center p-6 text-[13px] text-ink-muted">
                      {t({ en: "Preview unavailable.", zh: "预览暂不可用。" })}
                    </div>
                  ) : (
                    <img
                      src={previewSrc}
                      alt={t(item.label)}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      onError={() =>
                        setBrokenSrcs((prev) => ({
                          ...prev,
                          [previewSrc]: true,
                        }))
                      }
                      className="h-full w-full object-cover object-top"
                    />
                  )}

                  {/* 底部操作条：左侧语言标签，右侧 PDF 独立动作 */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-linear-to-t from-canvas via-canvas/90 to-transparent px-3.5 pt-8 pb-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setManualLang(item.id);
                      }}
                      className={`pointer-events-auto rounded-full border px-2.5 py-0.5 text-[12px] font-medium transition-all duration-200 ${
                        isActive
                          ? "border-accent bg-accent text-canvas shadow-xs"
                          : "border-line/70 bg-canvas/95 text-ink-muted hover:border-accent hover:text-ink-bold"
                      }`}
                    >
                      {t(item.label)}
                    </button>

                    {isActive && (
                      <a
                        href={pdfHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="pointer-events-auto inline-flex items-center gap-1 rounded-full border border-accent bg-ink-bold px-3 py-1 text-[12px] font-medium text-canvas shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent active:translate-y-0"
                      >
                        <span>PDF</span>
                        <ArrowUpRight size={13} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Chapter>
  );
}
