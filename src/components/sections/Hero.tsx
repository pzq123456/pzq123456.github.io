import { motion, type Variants } from "framer-motion";
import { Github, Globe } from "lucide-react";
import { PERSONAL_INFO } from "@/data/portfolio.generated";
import { useApp } from "@/context/AppContext";
import HeroTopography from "@/components/HeroTopography";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const AvatarImage = ({ className }: { className?: string }) => (
  <div
    className={`relative overflow-hidden border border-line bg-canvas ${className}`}
  >
    <img
      src="https://avatars.githubusercontent.com/u/82391775?v=4"
      alt="Pan Zhiqing"
      className="h-full w-full object-cover object-top"
    />
  </div>
);

export default function Hero() {
  const { t, lang } = useApp();
  const name =
    lang === "zh" ? PERSONAL_INFO.name.zh : PERSONAL_INFO.name.en;
  const [firstName, ...restName] = name.split(" ");

  return (
    <section
      id="about"
      className="relative flex min-h-[calc(100svh-4rem)] flex-col justify-center overflow-visible px-8 py-8 md:px-16 md:py-12"
    >
      <HeroTopography />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-start gap-10 lg:grid lg:grid-cols-12 lg:items-center lg:gap-12"
      >
        <div className="w-full lg:col-span-7">
          <motion.h1
            variants={itemVariants}
            className="mb-5 font-display text-[54px] leading-[0.92] tracking-[-0.02em] text-ink-bold sm:text-[68px] md:text-[82px] lg:text-[88px]"
          >
            {lang === "zh" ? (
              name
            ) : (
              <>
                {firstName}{" "}
                {restName.length > 0 && (
                  <em className="italic">{restName.join(" ")}</em>
                )}
              </>
            )}
          </motion.h1>

          <motion.h2 variants={itemVariants} className="text-[21px] md:text-[22px] text-ink-muted leading-snug mb-5 max-w-[34ch]">
            {t(PERSONAL_INFO.title)}
          </motion.h2>

          <motion.p variants={itemVariants} className="text-[16px] md:text-[17px] text-ink-base leading-[1.75] mb-9 max-w-[52ch]">
            {t({ en: "AI / Full-Stack developer working across Computer Vision, LLM systems and WebGIS.", zh: "专注计算机视觉、LLM 系统与 WebGIS 的 AI / 全栈开发者。" })}
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-row flex-wrap items-center gap-3">
            <a
              href="#cv"
              className="inline-flex h-10 md:h-11 items-center justify-center px-5 bg-ink-bold text-canvas font-medium text-[13px] text-center hover:bg-accent transition-colors duration-300"
            >
              {t({ en: "View CV", zh: "查看简历" })}
            </a>
            <a
              href="#projects"
              className="inline-flex h-10 md:h-11 items-center justify-center px-5 border border-line/60 text-ink-base font-medium text-[13px] text-center hover:border-accent/40 hover:bg-canvas-sub hover:text-accent transition-colors duration-300"
            >
              {t({ en: "Projects", zh: "项目" })}
            </a>
            <div className="flex justify-center gap-3">
              {[
                { icon: Github, href: `https://github.com/${PERSONAL_INFO.contact.github}` },
                { icon: Globe, href: PERSONAL_INFO.contact.website },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center border border-line/60 hover:border-accent hover:text-accent transition-colors bg-canvas text-ink-base"
                >
                  <social.icon size={17} />
                </a>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="w-full lg:col-span-5">
          <div className="flex items-center gap-6 lg:justify-end">
            <AvatarImage className="w-32 h-40 md:w-44 md:h-56" />
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
        className="absolute bottom-6 left-8 z-20 hidden items-center gap-3 text-[13px] tracking-wide text-ink-muted md:left-16 md:flex"
      >
        <span className="h-px w-8 bg-olive/60" />
        {t({ en: "Scroll to explore", zh: "向下滚动" })}
        <span aria-hidden="true" className="text-olive">
          ↓
        </span>
      </motion.div>
    </section>
  );
}
