import { useEffect, useMemo, useRef } from "react";
import { landMatrix, WORLD_COLS, WORLD_ROWS } from "@/utils/world";

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

// 经纬度 -> 网格（与 benchmark 提示词中的公式保持一致，含钳制防越界）
const geoToGrid = (lng: number, lat: number) => ({
  x: clamp(Math.floor(((lng + 180) / 360) * WORLD_COLS), 0, WORLD_COLS - 1),
  y: clamp(Math.floor(((90 - lat) / 180) * WORLD_ROWS), 0, WORLD_ROWS - 1),
});

const ANCHOR_CITIES = [
  { name: "HONG_KONG", ...geoToGrid(114.17, 22.3) },
  { name: "QINGDAO", ...geoToGrid(120.3, 36.1) },
];

const HOVER_RADIUS_SQ = 40;

export default function WorldMapMatrix({
  onHoverChange,
  onHoverCity,
}: {
  onHoverChange?: (hovered: boolean) => void;
  onHoverCity?: (city: "HONG_KONG" | "QINGDAO" | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const dots = useMemo(() => {
    const list: Array<{ x: number; y: number; anchor: boolean }> = [];
    const visited = new Set<string>();
    for (const city of ANCHOR_CITIES) {
      list.push({ x: city.x, y: city.y, anchor: true });
      visited.add(`${city.x}-${city.y}`);
    }
    for (let r = 0; r < WORLD_ROWS; r++) {
      const row = landMatrix[r];
      if (!row) continue;
      for (let c = 0; c < WORLD_COLS; c++) {
        if (row[c] === 1 && !visited.has(`${c}-${r}`)) {
          list.push({ x: c, y: r, anchor: false });
        }
      }
    }
    return list;
  }, []);

  // Canvas + rAF：hover 只写 ref 并按需重绘，不触发 React 渲染
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let land = "#6a9bcc";
    let anchor = "#d97757";
    const resolveColors = () => {
      const styles = getComputedStyle(canvas);
      land = styles.getPropertyValue("--map-land").trim() || land;
      anchor = styles.getPropertyValue("--map-anchor").trim() || anchor;
    };
    resolveColors();

    // CSS 像素下的 uniform 缩放 + 居中（等价于 SVG meet，避免拉伸与 hover 错位）
    const view = { w: 0, h: 0, scale: 1, ox: 0, oy: 0 };
    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      view.w = Math.max(1, rect.width);
      view.h = Math.max(1, rect.height);
      canvas.width = Math.round(view.w * dpr);
      canvas.height = Math.round(view.h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      view.scale = Math.min(view.w / WORLD_COLS, view.h / WORLD_ROWS);
      view.ox = (view.w - view.scale * WORLD_COLS) / 2;
      view.oy = (view.h - view.scale * WORLD_ROWS) / 2;
    };

    let target: { x: number; y: number } | null = null;
    const shown = { x: 0, y: 0 };
    let hasShown = false;
    let glow = 0;
    let raf = 0;

    const draw = () => {
      ctx.clearRect(0, 0, view.w, view.h);
      const hoverActive = hasShown && glow > 0.01;
      const hx = shown.x;
      const hy = shown.y;
      for (const dot of dots) {
        ctx.fillStyle = dot.anchor ? anchor : land;
        let alpha = dot.anchor ? 1 : 0.5;
        let r = (dot.anchor ? 0.55 : 0.22) * view.scale;
        if (hoverActive) {
          const dx = dot.x - hx;
          const dy = dot.y - hy;
          const distSq = dx * dx + dy * dy;
          if (distSq < HOVER_RADIUS_SQ) {
            const dist = Math.sqrt(distSq);
            const effect = (1 - dist * 0.15) * glow;
            if (effect > alpha) {
              alpha = effect;
              r = Math.max(r, (0.45 - dist * 0.04) * view.scale);
            }
          }
        }
        ctx.globalAlpha = clamp(alpha, 0, 1);
        const px = view.ox + (dot.x + 0.5) * view.scale;
        const py = view.oy + (dot.y + 0.5) * view.scale;
        ctx.beginPath();
        ctx.arc(px, py, Math.max(0.6, r), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const frame = () => {
      raf = 0;
      if (reducedMotion) {
        target = null;
        glow = 0;
        draw();
        return;
      }
      if (target) {
        if (!hasShown) {
          shown.x = target.x;
          shown.y = target.y;
          hasShown = true;
        }
        shown.x += (target.x - shown.x) * 0.35;
        shown.y += (target.y - shown.y) * 0.35;
        glow += (1 - glow) * 0.25;
      } else {
        glow += (0 - glow) * 0.15;
        if (glow < 0.02) glow = 0;
      }
      draw();
      const moving =
        target !== null &&
        (Math.abs(target.x - shown.x) > 0.05 || Math.abs(target.y - shown.y) > 0.05);
      if (target !== null || glow > 0 || moving) {
        raf = requestAnimationFrame(frame);
      }
    };
    const kick = () => {
      if (raf === 0 && !reducedMotion) raf = requestAnimationFrame(frame);
    };

    const toGrid = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const gx = (clientX - rect.left - view.ox) / view.scale - 0.5;
      const gy = (clientY - rect.top - view.oy) / view.scale - 0.5;
      return {
        x: clamp(gx, 0, WORLD_COLS - 1),
        y: clamp(gy, 0, WORLD_ROWS - 1),
      };
    };

    const onMove = (e: MouseEvent) => {
      target = toGrid(e.clientX, e.clientY);
      onHoverChange?.(true);

      let nearest: "HONG_KONG" | "QINGDAO" | null = null;
      let best = 36;
      for (const city of ANCHOR_CITIES) {
        const dx = city.x - target.x;
        const dy = city.y - target.y;
        const distance = dx * dx + dy * dy;
        if (distance < best) {
          best = distance;
          nearest = city.name as "HONG_KONG" | "QINGDAO";
        }
      }
      onHoverCity?.(nearest);
      kick();
    };
    const onLeave = () => {
      target = null;
      onHoverChange?.(false);
      onHoverCity?.(null);
      kick();
    };

    resize();
    draw();

    const ro = new ResizeObserver(() => {
      resize();
      draw();
      if (target) kick();
    });
    ro.observe(container);

    const mo = new MutationObserver(() => {
      resolveColors();
      draw();
      if (target) kick();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    container.addEventListener("mousemove", onMove, { passive: true });
    container.addEventListener("mouseleave", onLeave, { passive: true });

    return () => {
      if (raf !== 0) cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseleave", onLeave);
    };
  }, [dots, onHoverChange, onHoverCity]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative select-none cursor-crosshair group/map overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full [mask-image:radial-gradient(ellipse_at_center,black_75%,transparent_100%)]"
      />
    </div>
  );
}
