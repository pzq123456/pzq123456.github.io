import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Tone = "paper" | "muted" | "dark";

interface BlueprintBoxProps {
  title?: string;
  children: ReactNode;
  id?: string;
  className?: string;
  tone?: Tone;
  padded?: boolean;
  bottom?: ReactNode;
  index?: string;
  kicker?: string;
  display?: string;
}

export const BlueprintBox = ({
  title,
  children,
  id,
  className = "",
  tone = "paper",
  padded = true,
  bottom,
  index,
  kicker,
  display,
}: BlueprintBoxProps) => {
  const reduceMotion = useReducedMotion();
  const dark = tone === "dark";

  return (
    <section
      id={id}
      className={`relative px-8 md:px-16 overflow-visible ${
        dark ? "theme-dark text-ink-base" : ""
      } ${padded ? "py-[clamp(80px,10vh,144px)]" : ""} ${className}`}
    >
      {tone !== "paper" && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 -left-[100vw] -right-[100vw] ${
            dark ? "section-tone-dark" : "section-tone-muted"
          }`}
        />
      )}

      {(index || kicker || title) && (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mb-10 md:mb-14"
        >
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-4 md:gap-5">
              {index && (
                <span className="font-display text-[42px] md:text-[58px] leading-[0.72] text-coral">
                  {index}
                </span>
              )}
              <div className="pt-0.5">
                {kicker && (
                  <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-ink-muted">
                    {kicker}
                  </p>
                )}
                {title && (
                  <h2 className="mt-3 max-w-2xl font-serif text-[30px] md:text-[40px] font-medium leading-[1.05] tracking-tight text-ink-bold">
                    {title}
                  </h2>
                )}
              </div>
            </div>

            {display && (
              <span
                aria-hidden="true"
                className="hidden lg:block shrink-0 font-display text-[clamp(4rem,7vw,7rem)] leading-[0.72] text-ink-bold/[0.07]"
              >
                {display}
              </span>
            )}
          </div>
        </motion.div>
      )}

      <div className="relative z-10">{children}</div>

      {bottom && (
        <div className="absolute bottom-6 left-8 md:left-16 z-20">{bottom}</div>
      )}
    </section>
  );
};

export const BlueprintFooterWrapper = ({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) => (
  <footer
    id={id}
    className={`relative overflow-visible text-ink-base theme-dark footer-dark py-12 md:py-16 ${className}`}
  >
    <div className="relative z-10 w-full max-w-6xl mx-auto">{children}</div>
  </footer>
);
