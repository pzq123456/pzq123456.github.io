import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { PERSONAL_INFO } from "@/data/portfolio.generated";

const NAV_LINKS = [
  { id: "about", en: "About", zh: "关于" },
  { id: "experience", en: "Experience", zh: "经历" },
  { id: "projects", en: "Projects", zh: "项目" },
  { id: "world", en: "World", zh: "世界" },
  { id: "cv", en: "CV", zh: "简历" },
  { id: "contact", en: "Contact", zh: "联系" },
];

export default function Navbar() {
  const { lang, setLang, theme, toggleTheme, t } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // 监听滚动以控制高度压缩
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const renderNavLinks = (isMobile = false) => (
    <>
      {NAV_LINKS.map((link, index) => (
        <a
          key={link.id}
          href={`#${link.id}`}
          onClick={() => isMobile && setIsMenuOpen(false)}
          className={
            isMobile
              ? "flex items-end justify-between border-b border-line pb-3 group transition-all"
              : "relative text-[13px] font-medium tracking-wide text-ink-muted hover:text-ink-bold transition-colors group/navitem px-1 py-2"
          }
          // 补回漏掉的动画序列延迟
          style={isMobile ? { 
            transitionDelay: `${index * 50}ms`,
            transform: isMenuOpen ? 'translateX(0)' : 'translateX(10px)' 
          } : {}}
        >
          <span className={isMobile ? "font-serif text-xl font-medium text-ink-bold group-hover:text-accent group-hover:translate-x-1 transition-all duration-500" : ""}>
            {t(link)}
          </span>
          {!isMobile && (
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-500 group-hover/navitem:w-full" />
          )}
        </a>
      ))}
    </>
  );

  const renderLogo = () => (
    <div
      className="flex items-center gap-2.5 group cursor-pointer"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent transition-transform duration-300 group-hover:scale-125" />
      <p className="font-serif text-[19px] font-medium tracking-tight text-ink-bold">
        {lang === "zh" ? PERSONAL_INFO.name.zh : PERSONAL_INFO.name.en}
      </p>
    </div>
  );

  return (
    <>
      {/* 补回遮罩层级与语义化颜色 */}
      <div 
        className={`fixed inset-0 bg-ink-bold/10 dark:bg-black/40 backdrop-blur-sm z-90 transition-opacity duration-500 lg:hidden ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      <nav className={`
        fixed top-0 z-100 w-full transition-all duration-500 border-b
        ${scrolled 
          ? "h-14 bg-canvas/80 backdrop-blur-xl border-line/50" 
          : "h-16 bg-transparent border-transparent"}
      `}>
        <div className="max-w-6xl mx-auto px-8 md:px-16 h-full flex items-center justify-between">
          {renderLogo()}

          <div className="flex items-center gap-6 md:gap-10">
            <div className="hidden lg:flex gap-7 items-center">
              {renderNavLinks()}
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-line/50">
              {/* 模式切换 */}
              <button 
                onClick={toggleTheme} 
                className="p-2 text-ink-muted hover:text-accent hover:bg-canvas-sub rounded-full transition-all"
              >
                {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
              </button>

              {/* 语言切换 */}
              <button
                onClick={() => setLang(lang === "en" ? "zh" : "en")}
                className="px-2 py-1 text-xs font-medium text-ink-muted transition-colors hover:text-ink-bold"
              >
                {lang === "en" ? "EN" : "中"}
              </button>

              {/* 移动端开关 */}
              <button className="lg:hidden p-1 text-ink-muted hover:text-accent transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* 移动端菜单面板 - 补齐动画与页脚细节 */}
        <div className={`
          absolute inset-x-0 top-full h-[calc(100vh-100%)] bg-canvas/95 backdrop-blur-3xl transition-all duration-500 lg:hidden border-t border-line overflow-y-auto
          ${isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}
        `}>
          <div className="flex flex-col p-8 pt-12 gap-6 h-full">
            {renderNavLinks(true)}
          </div>
        </div>
      </nav>
      
      {/* 占位层：防止 sticky/fixed 导致的内容突跳 */}
      <div className="h-16 w-full pointer-events-none" />
    </>
  );
}