import { ArrowUpRight } from "lucide-react";
import PostCard from "@/blog/components/PostCard";
import { POSTS } from "@/blog/posts";
import { useApp } from "@/context/AppContext";
import { Chapter } from "../Chapter";

/** Landing-page teaser: the same PostCard as /blog, in a three-up layout. */
export default function BlogHighlights() {
  const { t } = useApp();

  return (
    <Chapter
      id="notes"
      index="01"
      display="NOTES"
      tone="muted"
      title={t({ en: "Recent notes.", zh: "最近写下的。" })}
    >
      <div className="grid gap-x-8 gap-y-12 md:grid-cols-3">
        {POSTS.slice(0, 3).map((post, index) => (
          <PostCard key={post.slug} post={post} index={index} variant="tile" />
        ))}
      </div>

      <div className="mt-14">
        <a
          href="#/blog"
          className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.16em] text-accent transition-colors hover:text-ink-bold"
        >
          {t({ en: "All notes", zh: "全部文章" })}
          <ArrowUpRight size={14} />
        </a>
      </div>
    </Chapter>
  );
}
