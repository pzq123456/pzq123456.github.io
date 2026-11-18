import { Github, Globe, ArrowUpRight } from "lucide-react";
import { Chapter } from "../Chapter";
import { GALLERY_PROJECTS } from "@/data/projects";
import { useApp } from "@/context/AppContext";

const PROJECT_META = [
  { en: "Spatial clustering · WebGIS", zh: "空间聚类 · WebGIS" },
  { en: "Trajectory data · WebWorkers", zh: "轨迹数据 · WebWorkers" },
  { en: "3D map · Deck.gl", zh: "三维地图 · Deck.gl" },
];

export default function Gallery() {
  const { t } = useApp();

  return (
    <Chapter
      title={t({ en: "Featured Projects", zh: "精选项目" })}
      id="projects"
      tone="muted"
      index="03"
      display="WORK"
    >
      <div className="space-y-14 md:space-y-20">
        {GALLERY_PROJECTS.map((proj, idx) => {
          const feature = idx === 0;
          const meta = PROJECT_META[idx] ?? PROJECT_META[0];
          const reversed = idx === 1;

          return (
            <article
              key={idx}
              className={
                feature
                  ? ""
                  : "grid gap-6 md:grid-cols-12 md:gap-10"
              }
            >
              <a
                href={proj.resources.website}
                target="_blank"
                rel="noreferrer"
                className={`group relative block overflow-hidden border border-line/60 bg-ink ${
                  feature ? "" : `md:col-span-7 ${reversed ? "md:order-2" : ""}`
                }`}
              >
                <div
                  className={`overflow-hidden ${
                    feature ? "aspect-[16/8]" : "aspect-[16/10]"
                  }`}
                >
                  <img
                    src={proj.image}
                    alt={t(proj.title)}
                    loading={feature ? "eager" : "lazy"}
                    className="h-full w-full object-cover opacity-95 transition-transform duration-700 group-hover:scale-[1.015] group-hover:opacity-100"
                  />
                </div>
                <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-canvas/90 text-ink-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <ArrowUpRight size={16} />
                </span>
              </a>

              <div
                className={
                  feature
                    ? "mt-6 grid gap-4 md:grid-cols-12 md:items-end"
                    : `md:col-span-5 md:py-2 ${reversed ? "md:order-1" : ""}`
                }
              >
                <div className={feature ? "md:col-span-8" : ""}>
                  <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-ink-muted">
                    <span className="text-coral">0{idx + 1}</span>
                    <span className="mx-2 text-line">/</span>
                    {t(meta)}
                  </p>
                  <h3 className="mt-3 font-serif text-[26px] font-medium leading-tight tracking-tight text-ink-bold md:text-[32px]">
                    {t(proj.title)}
                  </h3>
                </div>

                <div className={feature ? "md:col-span-4" : "mt-4"}>
                  <p className="max-w-md font-serif text-[16px] italic leading-[1.7] text-ink-muted">
                    {t(proj.desc)}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
                    <a
                      href={proj.resources.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted transition-colors hover:text-accent"
                    >
                      <Globe size={13} />
                      {t({ en: "Live demo", zh: "在线演示" })}
                      <ArrowUpRight size={12} />
                    </a>

                    {proj.resources.github && (
                      <a
                        href={proj.resources.github}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted transition-colors hover:text-accent"
                      >
                        <Github size={13} />
                        {t({ en: "Source", zh: "源代码" })}
                        <ArrowUpRight size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </Chapter>
  );
}
