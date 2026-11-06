import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BlueprintBox } from "../BlueprintLayout";
import { QUANT_RESEARCH_DATA } from "@/data/quant";
import { useApp } from "@/context/AppContext";
import { getTechStyle } from "@/utils/tech";

export default function Research() {
  const { t } = useApp();
  const data = QUANT_RESEARCH_DATA;
  
  const [activeIndex, setActiveIndex] = useState(0);
  const activeFactor = data.factors[activeIndex];

  const nextSlide = () => setActiveIndex((prev) => (prev + 1) % data.factors.length);
  const prevSlide = () => setActiveIndex((prev) => (prev - 1 + data.factors.length) % data.factors.length);

  return (
    <BlueprintBox
      title={t({ en: "Research", zh: "研究" })}
      id="research"
      tone="muted"
      index="04"
      kicker="RESEARCH"
      display="ALPHA"
    >
      <div className="flex flex-col gap-10">
        
        {/* 1. Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="flex-1 space-y-3">
            <span className="font-mono text-[12px] tracking-wider text-ink-muted">
              AlphaGPT · {data.period}
            </span>
            {/* 使用 text-ink-bold 确保标题清晰 */}
            <p className="text-lg md:text-xl font-serif italic text-ink-bold leading-snug max-w-3xl">
              {t(data.summary)}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-1.5">
            {data.technicalStack.map(tech => {
              const style = getTechStyle(tech);
              return (
                <span key={tech} className="px-2.5 py-1 text-[12px] font-medium leading-none" style={{ backgroundColor: style.bg, color: style.text }}>
                  {tech}
                </span>
              );
            })}
          </div>
        </div>

        {/* 2. Research Lab Content */}
        <div className="grid lg:grid-cols-12 gap-8 border-t border-line/50 pt-8">
          
          {/* 左侧：逻辑终端 */}
          <div className="lg:col-span-4 space-y-6">
            {/* 这里的 text-ink-muted 比 faint 更有可读性 */}
            <h4 className="font-mono text-[12px] text-ink-muted tracking-wider">
              Timeline
            </h4>

            <div className="font-mono text-[12px] space-y-4 text-ink-base border-l border-line/60 pl-4 py-1">
              <p className="leading-relaxed">init.pipeline — SymbolicReg + RL_Model</p>

              <div className="space-y-1 border-t border-line/60 pt-3">
                <p className="text-ink-muted text-[12px] pb-1">Factors</p>
                {data.factors.map((f, i) => (
                  <div
                    key={f.id}
                    onClick={() => setActiveIndex(i)}
                    className={`flex justify-between cursor-pointer transition-colors py-1 ${i === activeIndex ? "text-accent" : "text-ink-muted hover:text-ink-base"}`}
                  >
                    <span>Factor 0{i + 1}</span>
                    <span>R:{f.metrics.sharpeRollingThreeMonth.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧：因子观测台 */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="relative group/slider overflow-hidden border border-line bg-canvas-sub">
              
              {/* 图片展示区 */}
              <div className="relative aspect-21/9 bg-black overflow-hidden">
                <img
                  key={activeFactor.id}
                  src={activeFactor.image}
                  className="w-full h-full object-contain opacity-95 hover:opacity-100 transition-opacity duration-500"
                  alt="Backtest Analysis"
                />
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/slider:opacity-100 transition-opacity">
                  <button onClick={prevSlide} className="p-2 bg-black/80 text-white hover:bg-accent transition-colors border border-white/10">
                    <ChevronLeft size={14} />
                  </button>
                  <button onClick={nextSlide} className="p-2 bg-black/80 text-white hover:bg-accent transition-colors border border-white/10">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* 详情数据：严格遵循样式表层级 */}
              <div className="p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-[12px] font-mono text-ink-muted tracking-wider">Factor</p>
                  <p className="text-sm font-mono font-medium text-ink-bold">{activeFactor.id}</p>
                </div>

                <div className="flex gap-8">
                  <div className="text-right">
                    <p className="text-[12px] font-mono text-ink-muted mb-1">Sharpe · 3Y</p>
                    <p className="text-2xl font-mono font-medium text-ink-bold">
                      {activeFactor.metrics.sharpeThreeYear.toFixed(3)}
                    </p>
                  </div>
                  <div className="text-right border-l border-line pl-8">
                    <p className="text-[12px] font-mono text-accent mb-1">Rolling · 3M</p>
                    <p className="text-2xl font-mono font-medium text-accent">
                      R:{activeFactor.metrics.sharpeRollingThreeMonth.toFixed(3)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 指示器 */}
            <div className="flex gap-2 self-end">
              {data.factors.map((_, i) => (
                <div 
                  key={i} 
                  onClick={() => setActiveIndex(i)}
                  className={`h-1 transition-all duration-500 cursor-pointer ${i === activeIndex ? 'w-8 bg-accent' : 'w-2 bg-line hover:bg-ink-muted'}`} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </BlueprintBox>
  );
}