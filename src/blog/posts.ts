import type { ComponentType } from "react";
import HelloWorld from "./posts/hello-world.mdx";

export interface BlogPost {
  slug: string;
  title: string;
  /** ISO date, e.g. "2026-11-17". Newest posts are listed first. */
  date: string;
  description: string;
  Content: ComponentType;
}

/**
 * Explicit registration keeps the blog small and predictable.
 * Add a post by importing its MDX file and appending one entry here.
 */
const REGISTRY: BlogPost[] = [
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
