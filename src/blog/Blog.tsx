import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { MDXComponents } from "mdx/types";
import { useRef } from "react";
import { useApp } from "@/context/AppContext";
import ArticleCopyButton from "./components/ArticleCopyButton";
import CodeFigure from "./components/CodeBlock";
import CoverArt from "./CoverArt";
import PostCard from "./components/PostCard";
import { formatDate } from "./formatDate";
import { POSTS, getPost, type BlogPost } from "./posts";

const blogMdxComponents: MDXComponents = {
  figure: CodeFigure,
};

function BlogIndex() {
  const { t } = useApp();

  return (
    <main className="mx-auto w-full max-w-6xl px-8 pb-24 pt-14 md:px-16 md:pb-32 md:pt-20">
      <header className="max-w-3xl">
        <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-ink-muted">
          <span className="text-coral">Blogs</span>
          <span className="mx-2 text-line">/</span>
          {t({ en: "Notes & experiments", zh: "笔记与实验" })}
        </p>

        <h1 className="mt-5 font-serif text-[42px] font-medium leading-[1.02] tracking-tight text-ink-bold md:text-[56px]">
          {t({
            en: "Notes, ideas, and small experiments.",
            zh: "笔记、想法，和一些小实验。",
          })}
        </h1>

        <p className="mt-5 max-w-xl text-[16px] leading-[1.75] text-ink-muted">
          {t({
            en: "Occasional Blogs about code, maps, mathematics, and the things I am trying to understand.",
            zh: "偶尔写一点关于代码、地图、数学，以及我还在理解的事情。",
          })}
        </p>
      </header>

      <div className="mt-14 border-t border-line/70 md:mt-16">
        {POSTS.map((post, index) => (
          <PostCard key={post.slug} post={post} index={index} />
        ))}
      </div>
    </main>
  );
}

function BlogArticle({ post }: { post: BlogPost }) {
  const { t, lang } = useApp();
  const Content = post.Content;
  const bodyRef = useRef<HTMLDivElement>(null);

  return (
    <main className="mx-auto w-full max-w-6xl px-8 pb-24 pt-12 md:px-16 md:pb-32 md:pt-16">
      <a
        href="#/blog"
        className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-accent"
      >
        <ArrowLeft size={13} />
        {t({ en: "All Blogs", zh: "全部文章" })}
      </a>

      <article className="mx-auto mt-10 max-w-[44rem] md:mt-14">
        <header className="border-b border-line/60 pb-8 md:pb-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <p className="flex flex-wrap items-center gap-2 pt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted">
              <span className="text-coral">Blogs</span>
              <span className="text-line">/</span>
              <time dateTime={post.date}>{formatDate(post.date, lang)}</time>
            </p>
            <ArticleCopyButton
              getText={() =>
                [
                  post.title,
                  formatDate(post.date, lang),
                  post.description,
                  bodyRef.current?.innerText.trim() ?? "",
                ]
                  .filter(Boolean)
                  .join("\n\n")
              }
            />
          </div>

          <h1 className="mt-5 font-serif text-[36px] font-medium leading-[1.06] tracking-tight text-ink-bold md:text-[48px]">
            {post.title}
          </h1>

          <div className="mt-7 aspect-[16/10] w-full overflow-hidden rounded-lg">
            <CoverArt seed={`${post.date}-${post.slug}`} rounded={false} />
          </div>

          <p className="mt-5 max-w-[38rem] font-serif text-[17px] italic leading-[1.7] text-ink-muted">
            {post.description}
          </p>
        </header>

        <div ref={bodyRef} className="article-body mt-9 md:mt-11">
          <Content components={blogMdxComponents} />
        </div>

        <footer className="mt-14 flex items-center justify-between border-t border-line/60 pt-6">
          <a
            href="#/blog"
            className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-accent"
          >
            <ArrowLeft size={13} />
            {t({ en: "Back to Blogs", zh: "返回文章列表" })}
          </a>
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
            {formatDate(post.date, lang)}
          </span>
        </footer>
      </article>
    </main>
  );
}

function BlogNotFound() {
  const { t } = useApp();

  return (
    <main className="mx-auto w-full max-w-6xl px-8 pb-24 pt-16 md:px-16 md:pt-24">
      <a
        href="#/blog"
        className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-accent"
      >
        <ArrowLeft size={13} />
        {t({ en: "All Blogs", zh: "全部文章" })}
      </a>

      <div className="mt-16 max-w-xl">
        <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-coral">
          404
        </p>
        <h1 className="mt-4 font-serif text-[36px] font-medium leading-tight tracking-tight text-ink-bold">
          {t({ en: "This note does not exist.", zh: "这篇文章不存在。" })}
        </h1>
        <a
          href="#/blog"
          className="mt-6 inline-flex items-center gap-2 text-[14px] font-medium text-accent transition-colors hover:text-ink-bold"
        >
          {t({ en: "Return to Blogs", zh: "返回文章列表" })}
          <ArrowUpRight size={14} />
        </a>
      </div>
    </main>
  );
}

export default function Blog({ slug }: { slug: string | null }) {
  if (slug) {
    const post = getPost(slug);
    return post ? <BlogArticle post={post} /> : <BlogNotFound />;
  }

  return <BlogIndex />;
}
