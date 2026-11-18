import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Tone = "paper" | "muted";

interface ChapterProps {
  id: string;
  index: string;
  title: string;
  display: string;
  tone?: Tone;
  children: ReactNode;
}

/**
 * Numbered page section: full-bleed tone band + chapter header + body.
 * Hero and Footer own their layouts, so they don't use this shell.
 */
export function Chapter({
  id,
  index,
  title,
  display,
  tone = "paper",
  children,
}: ChapterProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id={id}
      className="relative overflow-visible px-8 py-[clamp(80px,10vh,144px)] md:px-16"
    >
      {tone === "muted" && (
        <div
          aria-hidden="true"
          className="section-tone-muted pointer-events-none absolute inset-y-0 -left-[100vw] -right-[100vw]"
        />
      )}

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mb-10 md:mb-14"
      >
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4 md:gap-5">
            <span className="font-display text-[42px] leading-[0.72] text-coral md:text-[58px]">
              {index}
            </span>
            <h2 className="mt-3.5 max-w-2xl font-serif text-[30px] font-medium leading-[1.05] tracking-tight text-ink-bold md:text-[40px]">
              {title}
            </h2>
          </div>

          <span
            aria-hidden="true"
            className="hidden shrink-0 font-display text-[clamp(4rem,7vw,7rem)] leading-[0.72] text-ink-bold/[0.07] lg:block"
          >
            {display}
          </span>
        </div>
      </motion.div>

      <div className="relative z-10">{children}</div>
    </section>
  );
}
