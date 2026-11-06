/**
 * 技术领域定义与视觉映射
 */
const TECH_CATEGORIES = {
  FRONTEND: { id: "frontend" }, // 蓝色：React, UI
  BACKEND: { id: "backend" },   // 灰色：Node, DB
  SPATIAL: { id: "spatial" },   // 绿色：GIS, Map
  INFRA: { id: "infra" },       // 橙色：Docker, AWS
  AI_MATH: { id: "ai" },        // 紫色：PyTorch, Data Science
  LANGUAGE: { id: "lang" },     // 靛蓝：TS, Python
} as const;

/**
 * 语义规则库：用于自动推断未定义标签的分类
 */
const SEMANTIC_RULES = [
  { pattern: /react|vue|vite|tailwind|layout|ui|web/i, key: "FRONTEND" },
  { pattern: /node|sql|prisma|supabase|api|trpc|server|db|DB/i, key: "BACKEND" },
  { pattern: /map|gis|deck|spatial|geo|webworker/i, key: "SPATIAL" },
  { pattern: /docker|aws|vercel|git|ci|cd|deploy|hooks/i, key: "INFRA" },
  { pattern: /pytorch|vectorbt|matplotlib|analysis|ai|torch|n8n/i, key: "AI_MATH" },
  { pattern: /typescript|python|rust|js|golang/i, key: "LANGUAGE" },
] as const;

export const getTechStyle = (tag: string) => {
  const normalized = tag.toLowerCase().trim();
  
  // 匹配逻辑：寻找命中规则的第一个 key，找不到则默认 BACKEND
  const matched = SEMANTIC_RULES.find(r => r.pattern.test(normalized));
  const category = matched ? TECH_CATEGORIES[matched.key] : TECH_CATEGORIES.BACKEND;

  return {
    text: `var(--tag-${category.id}-text)`,
    bg: `var(--tag-${category.id}-bg)`,
    border: `var(--tag-${category.id}-border)`,
    dot: `var(--tag-${category.id}-text)`,
  };
};