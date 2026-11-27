import { ArrowUpRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import CoverArt from "../CoverArt";
import { formatDate } from "../formatDate";
import type { BlogPost } from "../posts";

type PostCardProps = {
  post: BlogPost;
  index: number;
  /** "row" = chronological list on /blog, "tile" = landing-page card. */
  variant?: "row" | "tile";
};

const focusClass =
  "focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent";

/** One post entry: the gradient cover and the text belong to the same link. */
export default function PostCard({
  post,
  index,
  variant = "row",
}: PostCardProps) {
  const { t, lang } = useApp();
  const isTile = variant === "tile";
  const number = String(index + 1).padStart(2, "0");

  return (
    <a
      href={`#/blog/${post.slug}`}
      className={
        isTile
          ? `group block ${focusClass}`
          : `group grid grid-cols-[6.5rem_1fr] items-start gap-5 border-b border-line/60 py-7 md:grid-cols-[11rem_1fr_auto] md:gap-8 md:py-8 ${focusClass}`
      }
    >
      <div
        className={
          isTile
            ? "aspect-[16/10] w-full overflow-hidden rounded-lg"
            : "aspect-[4/3] w-full overflow-hidden rounded-md md:aspect-[16/10]"
        }
      >
        <CoverArt
          seed={`${post.date}-${post.slug}`}
          rounded={false}
          className="transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>

      <div className={isTile ? "" : "min-w-0"}>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted">
          <time dateTime={post.date}>{formatDate(post.date, lang)}</time>
          <span className="mx-2 text-line">/</span>
          <span className="text-coral">{number}</span>
        </p>

        <h3
          className={
            isTile
              ? "mt-3 font-serif text-[23px] font-medium leading-snug tracking-tight text-ink-bold transition-colors duration-300 group-hover:text-accent md:text-[25px]"
              : "mt-2 font-serif text-[22px] font-medium leading-tight tracking-tight text-ink-bold transition-colors duration-300 group-hover:text-accent md:text-[26px]"
          }
        >
          {post.title}
        </h3>

        <p
          className={
            isTile
              ? "mt-2 line-clamp-3 font-serif text-[15px] italic leading-[1.7] text-ink-muted"
              : "mt-2 line-clamp-2 max-w-2xl text-[14px] leading-[1.7] text-ink-muted"
          }
        >
          {post.description}
        </p>

        {isTile && (
          <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted transition-colors duration-300 group-hover:text-accent">
            {t({ en: "Read note", zh: "阅读全文" })}
            <ArrowUpRight
              size={13}
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </span>
        )}
      </div>

      {!isTile && (
        <ArrowUpRight
          size={18}
          className="mt-1 hidden text-ink-faint transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent md:block"
        />
      )}
    </a>
  );
}
