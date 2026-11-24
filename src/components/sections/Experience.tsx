import { Chapter } from "../Chapter";
import { EXPERIENCE_DATA } from "@/data/portfolio.generated";
import { useApp } from "@/context/AppContext";
import { getTechStyle } from "@/utils/tech";

const stripMd = (s: string) =>
  s.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

export default function Experience() {
  const { t, lang } = useApp();

  return (
    <Chapter
      title={t({ en: "Experience", zh: "经历" })}
      id="experience"
      index="02"
      display="EXPERIENCE"
    >
      <div className="space-y-16">
        {EXPERIENCE_DATA.map((exp, idx) => {
          const details = (lang === "zh" ? exp.details.zh : exp.details.en).slice(0, 4);
          return (
            <div key={idx} className="grid md:grid-cols-12 gap-12 relative">
              <div className="md:col-span-3">
                <div className="sticky top-24 space-y-4">
                  <div className="text-ink-muted text-[14px] tracking-tight">
                    {exp.period}
                  </div>
                  <h4 className="text-[16px] text-ink-muted">
                    {t(exp.role)}
                  </h4>
                </div>
              </div>
              <div className="md:col-span-9 space-y-6">
                <h3 className="text-3xl font-serif font-medium text-ink-bold tracking-tight">
                  {t(exp.company)}
                </h3>

                {/* Skills used in this role — the skill catalog lives inside
                    each experience in base.json, not as a standalone list. */}
                {!!exp.tags.length && (
                  <div className="flex flex-wrap gap-1.5">
                    {exp.tags.map((tag) => {
                      const style = getTechStyle(tag);
                      return (
                        <span
                          key={tag}
                          className="px-2.5 py-1 text-[12px] font-medium leading-none ring-1 ring-line/40"
                          style={{ backgroundColor: style.bg, color: style.text }}
                        >
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                )}

                <ul className="space-y-4">
                  {details.map((detail, i) => (
                    <li key={i} className="flex gap-4 text-ink-base">
                      <span className="mt-2 w-1.5 h-1.5 shrink-0 bg-accent/40" />
                      <p className="text-[16px] md:text-[17px] leading-[1.75]">{stripMd(detail)}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </Chapter>
  );
}
