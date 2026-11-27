"use client";

import { useMemo, useState } from "react";
import type { Architecture } from "@/data/portfolio.generated";

type Lang = "en" | "zh";
type Tone = "spatial" | "ai" | "infra" | "backend";

interface NodeSpec {
  key: string;
  x: number;
  y: number;
  w: number;
  h: number;
  tone: Tone;
  tradeoff?: string;
}

interface LayerSpec {
  id: string;
  title: string;
  tradeoffTag: string;
  y: number;
  h: number;
}

interface EdgeSpec {
  id: string;
  from: string;
  to: string;
  d: string;
}

const VIEW_W = 740;
const VIEW_H = 404;

const LAYERS: LayerSpec[] = [
  {
    id: "ingest",
    title: "L1 · INGESTION & CHUNKING",
    tradeoffTag: "Trade-off: Incremental sync & dual chunking vs. latency",
    y: 14,
    h: 102,
  },
  {
    id: "vector",
    title: "L2 · HYBRID INDEX & RETRIEVAL",
    tradeoffTag: "Trade-off: Dense + BM25 & managed GPU vs. self-hosted cost",
    y: 134,
    h: 102,
  },
  {
    id: "query",
    title: "L3 · QUERY, RERANK & SYNTHESIS",
    tradeoffTag: "Trade-off: Cross-encoder rerank & citations vs. end-to-end latency",
    y: 254,
    h: 132,
  },
];

const BOXES: NodeSpec[] = [
  // L1
  {
    key: "documents",
    x: 30,
    y: 40,
    w: 198,
    h: 64,
    tone: "spatial",
    tradeoff: "增量拉取 · 多源统一格式",
  },
  {
    key: "etl",
    x: 271,
    y: 40,
    w: 198,
    h: 64,
    tone: "spatial",
    tradeoff: "去噪去重 · 保留文档结构",
  },
  {
    key: "chunk",
    x: 512,
    y: 40,
    w: 198,
    h: 64,
    tone: "spatial",
    tradeoff: "结构化/语义双路径切分",
  },
  // L2
  {
    key: "embed",
    x: 138,
    y: 160,
    w: 218,
    h: 64,
    tone: "ai",
    tradeoff: "向量+稀疏双表示 · 权衡算力与吞吐",
  },
  {
    key: "store",
    x: 384,
    y: 160,
    w: 218,
    h: 64,
    tone: "infra",
    tradeoff: "向量+倒排一体 · 专有名词精确命中",
  },
  // L3
  {
    key: "rewrite",
    x: 30,
    y: 282,
    w: 198,
    h: 88,
    tone: "ai",
    tradeoff: "多查询改写/意图路由 · 降噪提召回",
  },
  {
    key: "agent",
    x: 271,
    y: 282,
    w: 198,
    h: 88,
    tone: "ai",
    tradeoff: "多路召回 + 精排 · 精度与耗时取舍",
  },
  {
    key: "answer",
    x: 512,
    y: 282,
    w: 198,
    h: 88,
    tone: "backend",
    tradeoff: "强引用溯源 + 诚实边界 · 控幻觉",
  },
];

const EDGES: EdgeSpec[] = [
  { id: "doc-etl", from: "documents", to: "etl", d: "M228 72 H271" },
  { id: "etl-chunk", from: "etl", to: "chunk", d: "M469 72 H512" },
  {
    id: "chunk-embed",
    from: "chunk",
    to: "embed",
    d: "M611 104 V125 Q611 130 606 130 H252 Q247 130 247 135 V160",
  },
  { id: "embed-store", from: "embed", to: "store", d: "M356 192 H384" },
  {
    id: "store-agent",
    from: "store",
    to: "agent",
    d: "M493 224 V245 Q493 250 488 250 H375 Q370 250 370 255 V282",
  },
  { id: "rewrite-agent", from: "rewrite", to: "agent", d: "M228 326 H271" },
  { id: "agent-answer", from: "agent", to: "answer", d: "M469 326 H512" },
];

function charWeight(ch: string): number {
  return /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(ch) ? 1.8 : 1;
}

function measure(text: string): number {
  let sum = 0;
  for (const ch of text) sum += charWeight(ch);
  return sum;
}

function wrapHint(text: string | undefined, maxWeight = 30): string[] {
  if (!text) return [];
  const clean = text.trim();
  if (!clean) return [];

  const hasSpace = /\s/.test(clean);
  const units = hasSpace ? clean.split(/\s+/) : Array.from(clean);
  const joiner = hasSpace ? " " : "";

  const lines: string[] = [];
  let current = "";
  let idx = 0;

  while (idx < units.length) {
    const unit = units[idx];
    const next = current ? `${current}${joiner}${unit}` : unit;

    if (measure(next) <= maxWeight || !current) {
      current = next;
      idx += 1;
    } else {
      lines.push(current);
      if (lines.length === 2) break;
      current = unit;
      idx += 1;
    }
  }

  if (current && lines.length < 2) {
    lines.push(current);
  }

  if (lines.length === 2 && idx < units.length) {
    let line2 = lines[1];
    while (line2.length > 2 && measure(`${line2}…`) > maxWeight) {
      line2 = hasSpace && line2.includes(" ") ? line2.replace(/\s+\S+$/, "") : line2.slice(0, -1);
    }
    lines[1] = `${line2}…`;
  }

  return lines;
}

function MiniIcon({ nodeKey, color }: { nodeKey: string; color: string }) {
  if (nodeKey === "documents") {
    return (
      <g opacity="0.9">
        <rect x="2.5" y="0.5" width="9" height="11.5" rx="1.2" fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.5" />
        <path d="M0 2.5 H6.5 L8.8 4.8 V13.5 H0 Z" fill="var(--bg-surface, #faf8f5)" stroke={color} strokeWidth="1.05" />
        <path d="M6.5 2.5 V4.8 H8.8" fill="none" stroke={color} strokeWidth="0.95" />
        <line x1="2" y1="7.8" x2="6.8" y2="7.8" stroke={color} strokeWidth="0.95" strokeOpacity="0.7" />
        <line x1="2" y1="10.4" x2="5.2" y2="10.4" stroke={color} strokeWidth="0.95" strokeOpacity="0.55" />
      </g>
    );
  }
  if (nodeKey === "etl") {
    return (
      <g opacity="0.9">
        <rect x="0.5" y="1" width="12.5" height="12.5" rx="2" fill="none" stroke={color} strokeWidth="1.05" strokeDasharray="2 1.2" />
        <path d="M3 4.8 H10.5 M3 7.8 H8.8 M3 10.8 H9.8" stroke={color} strokeWidth="1.05" strokeLinecap="round" />
      </g>
    );
  }
  if (nodeKey === "chunk") {
    return (
      <g opacity="0.9">
        <rect x="0.5" y="1.5" width="5.2" height="4.8" rx="1" fill="none" stroke={color} strokeWidth="1.05" />
        <rect x="7.2" y="1.5" width="5.2" height="4.8" rx="1" fill="none" stroke={color} strokeWidth="1.05" />
        <rect x="0.5" y="7.8" width="11.9" height="4.8" rx="1" fill="none" stroke={color} strokeWidth="1.05" />
      </g>
    );
  }
  if (nodeKey === "embed") {
    return (
      <g opacity="0.9">
        <circle cx="3" cy="3.5" r="1.35" fill={color} />
        <circle cx="7.8" cy="2.8" r="1.15" fill={color} fillOpacity="0.65" />
        <circle cx="11.8" cy="5" r="1.35" fill={color} />
        <circle cx="5.2" cy="8.2" r="1.25" fill={color} fillOpacity="0.75" />
        <circle cx="9.8" cy="9.8" r="1.45" fill={color} />
        <circle cx="3.5" cy="12" r="1.1" fill={color} fillOpacity="0.6" />
      </g>
    );
  }
  if (nodeKey === "store") {
    return (
      <g opacity="0.9">
        <rect x="1" y="1.5" width="11.5" height="3" rx="0.85" fill="none" stroke={color} strokeWidth="1.05" />
        <rect x="1" y="5.8" width="11.5" height="3" rx="0.85" fill="none" stroke={color} strokeWidth="1.05" />
        <rect x="1" y="10.1" width="11.5" height="3" rx="0.85" fill="none" stroke={color} strokeWidth="1.05" />
      </g>
    );
  }
  return null;
}

export default function ArchitectureDiagram({
  architecture,
  lang,
  framed = true,
}: {
  architecture: Architecture;
  lang: Lang;
  /** Gallery cards already supply a border; standalone demos need this one. */
  framed?: boolean;
}) {
  const nodes = architecture[lang];
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const activeEdges = useMemo(() => {
    if (!hoveredKey) return new Set<string>();
    return new Set(
      EDGES.filter((e) => e.from === hoveredKey || e.to === hoveredKey).map((e) => e.id)
    );
  }, [hoveredKey]);

  const connectedNodes = useMemo(() => {
    if (!hoveredKey) return new Set<string>();
    const set = new Set<string>([hoveredKey]);
    for (const e of EDGES) {
      if (e.from === hoveredKey) set.add(e.to);
      if (e.to === hoveredKey) set.add(e.from);
    }
    return set;
  }, [hoveredKey]);

  return (
    <div
      className={
        framed
          ? "w-full overflow-hidden rounded-2xl border border-(--border-color) bg-(--bg-surface,transparent)"
          : "w-full"
      }
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="block h-auto w-full select-none"
        role="img"
        aria-label={nodes.laneIndex?.label ?? "Architecture diagram"}
      >
        <defs>
          <pattern id="cv-layer-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.65" fill="var(--border-color)" opacity="0.55" />
          </pattern>

          <marker
            id="cv-arrow"
            viewBox="0 0 10 10"
            refX="7.5"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M1.5 2 L8 5 L1.5 8 z" fill="var(--text-faint)" />
          </marker>

          <marker
            id="cv-arrow-active"
            viewBox="0 0 10 10"
            refX="7.5"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M1.5 2 L8 5 L1.5 8 z" fill="var(--tag-ai-text)" />
          </marker>

          <style>{`
            @keyframes cvDashMove {
              to {
                stroke-dashoffset: -14;
              }
            }
            .cv-flow-line {
              stroke-dasharray: 3.5 3.5;
              animation: cvDashMove 0.8s linear infinite;
            }
          `}</style>
        </defs>

        <rect width={VIEW_W} height={VIEW_H} fill="url(#cv-layer-grid)" />

        {/* Architectural Layer Bands + Layer Trade-off Summary */}
        {LAYERS.map((layer) => (
          <g key={layer.id}>
            <rect
              x="16"
              y={layer.y}
              width={VIEW_W - 32}
              height={layer.h}
              rx="10"
              fill="var(--border-color)"
              fillOpacity="0.11"
              stroke="var(--border-color)"
              strokeWidth="0.75"
              strokeOpacity="0.45"
            />
            <text
              x="28"
              y={layer.y + 15}
              fontSize="8.2"
              fontWeight="600"
              letterSpacing="1.3"
              fill="var(--text-faint)"
              className="font-mono uppercase"
            >
              {layer.title}
            </text>
            <text
              x={VIEW_W - 28}
              y={layer.y + 15}
              textAnchor="end"
              fontSize="7.6"
              fill="var(--text-muted)"
              className="font-mono"
            >
              {layer.tradeoffTag}
            </text>
          </g>
        ))}

        {/* Connectors */}
        {EDGES.map((edge) => {
          const isHighlighted = activeEdges.has(edge.id);
          const isDimmed = hoveredKey !== null && !isHighlighted;
          return (
            <g
              key={edge.id}
              opacity={isDimmed ? 0.25 : 1}
              className="transition-opacity duration-150"
            >
              <path
                d={edge.d}
                fill="none"
                stroke={isHighlighted ? "var(--tag-ai-text)" : "var(--text-faint)"}
                strokeWidth={isHighlighted ? "1.45" : "1.15"}
                strokeLinecap="round"
                strokeLinejoin="round"
                markerEnd={isHighlighted ? "url(#cv-arrow-active)" : "url(#cv-arrow)"}
              />
              {isHighlighted && (
                <path
                  d={edge.d}
                  fill="none"
                  stroke="var(--tag-ai-text)"
                  strokeWidth="1.45"
                  strokeLinecap="round"
                  className="cv-flow-line"
                />
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {BOXES.map((box) => {
          const node = nodes[box.key];
          if (!node) return null;

          const isHovered = hoveredKey === box.key;
          const isRelated = connectedNodes.has(box.key);
          const isDimmed = hoveredKey !== null && !isRelated;

          const toneColor = `var(--tag-${box.tone}-text)`;
          const toneBg = `var(--tag-${box.tone}-bg)`;

          const hasIcon = ["documents", "etl", "chunk", "embed", "store"].includes(box.key);
          const hints = wrapHint(node.hint, 31);
          const hasTradeoff = Boolean(box.tradeoff);

          return (
            <g
              key={box.key}
              onMouseEnter={() => setHoveredKey(box.key)}
              onMouseLeave={() => setHoveredKey(null)}
              opacity={isDimmed ? 0.45 : 1}
              transform={isHovered ? "translate(0, -1)" : "translate(0, 0)"}
              className="cursor-pointer transition-all duration-150"
            >
              <rect
                x={box.x}
                y={box.y}
                width={box.w}
                height={box.h}
                rx="8"
                fill={toneBg}
                fillOpacity={isHovered ? "0.96" : "0.78"}
                stroke={toneColor}
                strokeWidth={isHovered ? "1.35" : "0.95"}
                strokeOpacity={isHovered ? "0.7" : "0.28"}
              />

              {/* Header: small icon + title */}
              <g transform={`translate(${box.x + box.w / 2}, ${box.y + 17})`}>
                {hasIcon && (
                  <g transform="translate(-78, -6)">
                    <MiniIcon nodeKey={box.key} color={toneColor} />
                  </g>
                )}
                <text
                  x={hasIcon ? 6 : 0}
                  y="3.5"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill={toneColor}
                >
                  {node.label}
                </text>
              </g>

              {/* Hint lines */}
              {hints.map((line, i) => (
                <text
                  key={i}
                  x={box.x + box.w / 2}
                  y={box.y + 33 + i * 10}
                  textAnchor="middle"
                  fontSize="7.8"
                  fill="var(--text-muted)"
                >
                  {line}
                </text>
              ))}

              {/* Engineering trade-off strip at bottom of card */}
              {hasTradeoff && (
                <>
                  <line
                    x1={box.x + 10}
                    y1={box.y + box.h - 17}
                    x2={box.x + box.w - 10}
                    y2={box.y + box.h - 17}
                    stroke={toneColor}
                    strokeWidth="0.6"
                    strokeOpacity="0.22"
                  />
                  <text
                    x={box.x + box.w / 2}
                    y={box.y + box.h - 6}
                    textAnchor="middle"
                    fontSize="7.3"
                    fontWeight="500"
                    fill={toneColor}
                    fillOpacity="0.85"
                  >
                    {box.tradeoff}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}