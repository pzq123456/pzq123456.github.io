import type { ComponentType } from "react";
import type { MDXComponents } from "mdx/types";
import HelloWorld from "./posts/hello-world.mdx";
import TimeTopography from "./posts/time-topography.mdx";
import BilingualRagArchitecture from "./posts/bilingual-rag-architecture.mdx";
import AfterZeroToOne from "./posts/after-zero-to-one.mdx";
import SubtractionAndWorldModel from "./posts/subtraction-and-world-model.mdx";
import ProceduralCoverShader from "./posts/procedural-cover-shader.mdx";

export interface BlogPost {
  slug: string;
  title: string;
  /** ISO date, e.g. "2026-11-17". Newest posts are listed first. */
  date: string;
  description: string;
  Content: ComponentType<{ components?: MDXComponents }>;
}

/**
 * Explicit registration keeps the blog small and predictable.
 * Add a post by importing its MDX file and appending one entry here.
 */
const REGISTRY: BlogPost[] = [
  {
    slug: "procedural-cover-shader",
    title: "从渐变到着色器：一次封面生成的技术路线切换",
    date: "2026-11-27",
    description:
      "记录一次把博客封面从 CSS 渐变换成 WebGL2 程序化绘画的过程：为什么换、五种视觉技术、seed 到参数的架构，以及一个可以直接拖动的交互演示。",
    Content: ProceduralCoverShader,
  },
  {
    slug: "subtraction-and-world-model",
    title: "做减法与建模型：有限观察下，智能体究竟在沉淀什么？",
    date: "2026-11-27",
    description:
      "把做减法的工程原则与世界模型的空间化视角接成一条线：在有限观察下，智能体该沉淀什么、如何组织沉淀，以及记忆作为经验刻痕的本质。",
    Content: SubtractionAndWorldModel,
  },
  {
    slug: "after-zero-to-one",
    title: "从0到1之后：垄断、平替与 AI 时代的技术平权",
    date: "2026-11-27",
    description:
      "从《从0到1》的垄断逻辑出发，穿过工业现实中的平替反击，走向 AI 时代的脑力工业化与能源终局，重新审视创新的上半场与下半场。",
    Content: AfterZeroToOne,
  },
  {
    slug: "bilingual-rag-architecture",
    title: "从 PDF 堆到可溯源问答：一套自托管双语 RAG 的三层架构",
    date: "2026-11-24",
    description:
      "用 Docling、BGE-M3、Qdrant、TEI 与 Pydantic AI 在 Python + Docker 上搭一套测绘文档 RAG：三层架构、八个节点，以及每个节点背后的取舍。",
    Content: BilingualRagArchitecture,
  },
  {
    slug: "time-topography",
    title: "把时间画进等高线：一张会呼吸的地形背景",
    date: "2026-11-20",
    description:
      "从三维梯度噪声到 Marching Squares，拆解首页地形背景的数学原理，以及为什么时间可以直接寻址。",
    Content: TimeTopography,
  },
  {
    slug: "hello-world",
    title: "你好，MDX",
    date: "2026-11-17",
    description:
      "一篇用来验证博客链路的短文：Markdown、一个可拖动的正弦波，以及现有主题。",
    Content: HelloWorld,
  },
];

export const POSTS: BlogPost[] = [...REGISTRY].sort(
  (a, b) => Date.parse(b.date) - Date.parse(a.date),
);

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((post) => post.slug === slug);
}
