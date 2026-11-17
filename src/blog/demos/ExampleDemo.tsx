import { useState } from "react";
import { useApp } from "@/context/AppContext";

const WIDTH = 640;
const HEIGHT = 240;
const PAD = 32;

export default function ExampleDemo() {
  const { t } = useApp();
  const [amplitude, setAmplitude] = useState(1);
  const [frequency, setFrequency] = useState(1);

  const centerY = HEIGHT / 2;
  const curve = Array.from({ length: 161 }, (_, index) => {
    const ratio = index / 160;
    const x = PAD + ratio * (WIDTH - PAD * 2);
    const y =
      centerY - Math.sin(ratio * Math.PI * 2 * frequency) * 72 * amplitude;
    return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");

  return (
    <div className="my-10 border border-line/70 bg-canvas-sub/50 p-4 font-sans md:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-coral">
          {t({ en: "Interactive demo", zh: "交互演示" })}
        </span>
        <span className="font-mono text-[12px] text-ink-muted">
          y = sin(2π · {frequency.toFixed(1)}x) × {amplitude.toFixed(1)}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={t({
          en: "A sine wave controlled by the sliders below.",
          zh: "由下方滑块控制的正弦曲线。",
        })}
        className="mt-4 h-auto w-full"
      >
        {Array.from({ length: 9 }, (_, index) => {
          const x = PAD + (index / 8) * (WIDTH - PAD * 2);
          return (
            <line
              key={`v-${index}`}
              x1={x}
              y1={PAD / 2}
              x2={x}
              y2={HEIGHT - PAD / 2}
              stroke="var(--border-color)"
              strokeDasharray={index === 4 ? undefined : "3 6"}
              strokeWidth="0.7"
              opacity={index === 4 ? 0.9 : 0.55}
            />
          );
        })}
        {Array.from({ length: 5 }, (_, index) => {
          const y = PAD / 2 + (index / 4) * (HEIGHT - PAD);
          return (
            <line
              key={`h-${index}`}
              x1={PAD}
              y1={y}
              x2={WIDTH - PAD}
              y2={y}
              stroke="var(--border-color)"
              strokeDasharray={index === 2 ? undefined : "3 6"}
              strokeWidth="0.7"
              opacity={index === 2 ? 0.9 : 0.55}
            />
          );
        })}

        <path
          d={curve}
          fill="none"
          stroke="var(--brand-accent)"
          strokeLinecap="round"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />

        <text
          x={WIDTH - PAD}
          y={HEIGHT - 10}
          textAnchor="end"
          fill="var(--text-faint)"
          fontFamily="var(--font-mono)"
          fontSize="11"
        >
          x
        </text>
        <text
          x={PAD - 8}
          y={PAD / 2 + 4}
          textAnchor="end"
          fill="var(--text-faint)"
          fontFamily="var(--font-mono)"
          fontSize="11"
        >
          y
        </text>
      </svg>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted">
            {t({ en: "Amplitude", zh: "振幅" })}
            <output className="text-ink-bold">{amplitude.toFixed(1)}</output>
          </span>
          <input
            type="range"
            min="0.2"
            max="1.5"
            step="0.1"
            value={amplitude}
            onChange={(event) => setAmplitude(Number(event.target.value))}
            className="h-1.5 w-full cursor-pointer"
            style={{ accentColor: "var(--brand-accent)" }}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted">
            {t({ en: "Frequency", zh: "频率" })}
            <output className="text-ink-bold">{frequency.toFixed(1)}</output>
          </span>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={frequency}
            onChange={(event) => setFrequency(Number(event.target.value))}
            className="h-1.5 w-full cursor-pointer"
            style={{ accentColor: "var(--brand-accent)" }}
          />
        </label>
      </div>
    </div>
  );
}
