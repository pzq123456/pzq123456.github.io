import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Chapter } from "../Chapter";
import { useApp } from "@/context/AppContext";

// CV section: pick a version -> preview -> download the PDF.
// Previews/PDFs are rendered locally by the resume pipeline into public/cv
// and committed (preview_<variant>-<lang>.webp / <variant>-<lang>.pdf).

type Variant = "fullstack" | "industry";

const VARIANTS: {
  id: Variant;
  label: { en: string; zh: string };
  blurb: { en: string; zh: string };
}[] = [
  {
    id: "fullstack",
    label: { en: "Full-Stack", zh: "全栈" },
    blurb: {
      en: "Full-stack emphasis (React/TS · RAG · FastAPI).",
      zh: "全栈方向（React/TS · RAG · FastAPI）。",
    },
  },
  {
    id: "industry",
    label: { en: "Machine Vision", zh: "机器视觉" },
    blurb: {
      en: "Industrial one-pager (machine vision · inspection).",
      zh: "工业界一页纸（机器视觉 · 质检）。",
    },
  },
];

const previewUrlFor = (variant: Variant, lang: string) =>
  `/cv/preview_${variant}-${lang}.webp`;

export default function CvWorkspace() {
  const { t, lang } = useApp();
  const [variant, setVariant] = useState<Variant>("fullstack");
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const current = VARIANTS.find((v) => v.id === variant) ?? VARIANTS[0];
  const previewUrl = previewUrlFor(variant, lang);
  const pdfUrl = `/cv/${variant}-${lang}.pdf`;
  const previewFailed = failedUrl === previewUrl;
  const previewLoaded = loadedUrl === previewUrl;

  // Warm the default preview while the browser is idle. Selection itself is
  // immediate: the card never waits for the image before changing state.
  useEffect(() => {
    const id = window.setTimeout(() => {
      const img = new Image();
      img.src = previewUrlFor("fullstack", lang);
    }, 1200);
    return () => window.clearTimeout(id);
  }, [lang]);
  const prefetch = (id: Variant) => {
    if (id === variant) return;
    const img = new Image();
    img.src = previewUrlFor(id, lang);
  };

  return (
    <Chapter
      title={t({ en: "CV", zh: "简历" })}
      id="cv"
      tone="muted"
      index="05"
      display="DOCUMENT"
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <p className="mb-5 max-w-sm text-[14px] leading-relaxed text-ink-muted">
            {t({
              en: "Pick the version that fits the conversation.",
              zh: "选择最贴合这次对话的版本。",
            })}
          </p>

          <div className="flex flex-wrap gap-2">
            {VARIANTS.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariant(v.id)}
                onPointerEnter={() => prefetch(v.id)}
                onFocus={() => prefetch(v.id)}
                aria-pressed={variant === v.id}
                className={`px-3 py-2 text-[13px] font-medium border transition-colors duration-300 ${
                  variant === v.id
                    ? "bg-ink-bold text-canvas border-ink-bold"
                    : "border-line/60 text-ink-muted hover:border-accent/50 hover:text-ink-bold"
                }`}
              >
                {t(v.label)}
              </button>
            ))}
          </div>

          <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-ink-muted">
            {t(current.blurb)}
          </p>

          <a
            href={pdfUrl}
            download
            className="mt-6 inline-flex h-11 items-center gap-2 px-4 text-[13px] font-medium bg-ink-bold text-canvas hover:bg-accent transition-colors duration-300"
          >
            <Download size={14} />
            {t({ en: "Download PDF", zh: "下载 PDF" })} · {lang.toUpperCase()}
          </a>
        </div>

        <div className="lg:col-span-8">
          <div className="relative mx-auto w-full max-w-[400px]">
            <div
              className="relative aspect-[210/297] overflow-hidden border border-line/70 bg-canvas"
              aria-busy={!previewLoaded && !previewFailed}
            >
              {previewFailed ? (
                <p className="absolute inset-0 flex items-center justify-center p-8 text-center text-[14px] leading-relaxed text-ink-muted">
                  {t({
                    en: "Preview is available on the deployed site.",
                    zh: "预览图在部署后的站点可用。",
                  })}
                </p>
              ) : (
                <>
                  {!previewLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8">
                      <div className="w-full max-w-[210px] space-y-3">
                        <div className="h-2.5 w-1/2 bg-line/70" />
                        <div className="h-2 w-full bg-line/40" />
                        <div className="h-2 w-5/6 bg-line/40" />
                        <div className="h-2 w-full bg-line/40" />
                        <div className="h-2 w-3/4 bg-line/40" />
                      </div>
                      <p className="text-[14px] text-ink-muted">
                        {t({ en: "Loading preview…", zh: "预览加载中…" })}
                      </p>
                    </div>
                  )}
                  <img
                    key={previewUrl}
                    src={previewUrl}
                    alt={t({ en: "Resume preview", zh: "简历预览" })}
                    loading="lazy"
                    decoding="async"
                    fetchPriority="high"
                    onLoad={() => setLoadedUrl(previewUrl)}
                    onError={() => setFailedUrl(previewUrl)}
                    className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ${
                      previewLoaded ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Chapter>
  );
}
