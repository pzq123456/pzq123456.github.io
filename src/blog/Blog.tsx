import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { POSTS, getPost, type BlogPost } from "./posts";

function formatDate(value: string, lang: "en" | "zh") {
  return new Intl.DateTimeFormat(lang === "zh" ? "zh-CN" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function BlogIndex() {
  const { t, lang } = useApp();

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
          <a
            key={post.slug}
            href={`#/blog/${post.slug}`}
            className="group grid gap-3 border-b border-line/60 py-7 md:grid-cols-12 md:gap-8 md:py-9"
          >
            <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted md:col-span-3">
              <span className="text-coral">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="h-px w-4 bg-line" />
              <time dateTime={post.date}>{formatDate(post.date, lang)}</time>
            </div>

            <div className="md:col-span-8">
              <h2 className="font-serif text-[26px] font-medium leading-tight tracking-tight text-ink-bold transition-colors duration-300 group-hover:text-accent md:text-[30px]">
                {post.title}
              </h2>
              <p className="mt-2 max-w-2xl text-[15px] leading-[1.7] text-ink-muted">
                {post.description}
              </p>
            </div>

            <div className="hidden items-start justify-end md:col-span-1 md:flex">
              <ArrowUpRight
                size={18}
                className="mt-1 text-ink-faint transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
              />
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}

function BlogArticle({ post }: { post: BlogPost }) {
  const { t, lang } = useApp();
  const Content = post.Content;

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
          <p className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted">
            <span className="text-coral">Blogs</span>
            <span className="text-line">/</span>
            <time dateTime={post.date}>{formatDate(post.date, lang)}</time>
          </p>

          <h1 className="mt-5 font-serif text-[36px] font-medium leading-[1.06] tracking-tight text-ink-bold md:text-[48px]">
            {post.title}
          </h1>

          <p className="mt-4 max-w-[38rem] font-serif text-[17px] italic leading-[1.7] text-ink-muted">
            {post.description}
          </p>
        </header>

        <div className="article-body mt-9 md:mt-11">
          <Content />
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
