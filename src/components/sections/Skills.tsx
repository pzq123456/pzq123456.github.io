import { BlueprintBox } from "../BlueprintLayout";
import { SKILLS_DATA } from "@/data/portfolio.generated";
import { useApp } from "@/context/AppContext";
import { getTechStyle } from "@/utils/tech";

const stripMd = (s: string) => s.replace(/\*\*/g, "");

export default function Skills() {
  const { t } = useApp();

  return (
    <BlueprintBox
      title={t({ en: "Skills", zh: "技能" })}
      id="skills"
      tone="muted"
      index="01"
      kicker="EXPERTISE"
      display="EXPERTISE"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
        {SKILLS_DATA.map((skill, idx) => (
          <div key={idx} className="flex flex-col h-full">
            <div className="space-y-4 flex-1">
              <h4 className="font-serif text-[17px] md:text-[18px] font-medium tracking-tight text-ink-bold leading-snug">
                {t(skill.category)}
              </h4>
              <div className="flex flex-wrap gap-2">
                {skill.items.slice(0, 6).map(item => {
                  const clean = stripMd(item);
                  const style = getTechStyle(clean);
                  return (
                    <span
                      key={clean}
                      className="px-2.5 py-1 text-[12px] leading-[1.1] font-medium cursor-default select-none"
                      style={{ backgroundColor: style.bg, color: style.text }}
                    >
                      {clean}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </BlueprintBox>
  );
}
