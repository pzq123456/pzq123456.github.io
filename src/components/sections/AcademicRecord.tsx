import { Globe, Github, FileText, ExternalLink } from "lucide-react";
import { BlueprintBox } from "../BlueprintLayout";
import { PUBLICATION_DATA, EDUCATION_DATA } from "@/data/portfolio.generated";
import { useApp } from "@/context/AppContext";

const stripMd = (s: string) => s.replace(/\*\*/g, "");

export default function AcademicRecord() {
  const { t } = useApp();
  const pub = PUBLICATION_DATA;
  const journal =
    pub.journal === "2025"
      ? "Urban Forestry & Urban Greening · 2025"
      : pub.journal;

  const resourceIcons = {
    github: <Github size={14} />,
    website: <Globe size={14} />,
    paper: <FileText size={14} />,
  };

  return (
    <BlueprintBox
      title={t({ en: "The record.", zh: "留下记录。" })}
      id="publications"
      index="05"
      kicker="RECORD"
      display="ARCHIVE"
    >
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-0">
        <div className="lg:col-span-7 lg:pr-12">
          <h3 className="mb-5 font-mono text-[12px] uppercase tracking-[0.2em] text-accent">
            {t({ en: "Publication", zh: "学术发表" })}
          </h3>

          <h4 className="max-w-xl font-serif text-[28px] font-medium leading-[1.12] tracking-tight text-ink-bold md:text-[34px]">
            {t(pub.title)}
          </h4>

          <p className="mt-4 font-mono text-[12px] tracking-wider text-ink-muted">
            {journal}
          </p>

          <p className="mt-7 max-w-xl border-l-2 border-line pl-4 font-serif text-[17px] italic leading-relaxed text-ink-base">
            {stripMd(t(pub.role))}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            {Object.entries(pub.resources).map(([key, url]) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-[13px] font-medium capitalize text-ink-muted transition-colors hover:text-accent"
              >
                <span className="text-accent/70">
                  {resourceIcons[key as keyof typeof resourceIcons] || (
                    <ExternalLink size={14} />
                  )}
                </span>
                {key}
              </a>
            ))}
            <span className="font-mono text-[12px] text-ink-faint">
              DOI {pub.doi}
            </span>
          </div>
        </div>

        <div
          id="education"
          className="lg:col-span-5 lg:border-l lg:border-line/60 lg:pl-12"
        >
          <h3 className="mb-5 font-mono text-[12px] uppercase tracking-[0.2em] text-olive">
            {t({ en: "Education", zh: "教育背景" })}
          </h3>

          <div className="space-y-10">
            {EDUCATION_DATA.map((edu, idx) => (
              <div key={idx}>
                <div className="flex items-center gap-2">
                  {edu.isDistinction && (
                    <span className="h-1.5 w-1.5 rounded-full bg-olive" />
                  )}
                  <p className="font-mono text-[12px] tracking-wider text-ink-muted">
                    {edu.date}
                  </p>
                </div>

                <h4 className="mt-2 font-serif text-[22px] font-medium leading-tight text-ink-bold">
                  {t(edu.school)}
                </h4>

                <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
                  {stripMd(t(edu.degree))}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BlueprintBox>
  );
}
