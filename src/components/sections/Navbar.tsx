
import { useCallback, useEffect, useRef, useState } from "react";
import { Home, Menu, Moon, Sun, X } from "lucide-react";
import { useApp } from "@/context/AppContext";

// ============================================================
// Navigation configuration
// ============================================================

type NavLink = {
  id: string;
  en: string;
  zh: string;
  href?: string;
};

const NAV_LINKS: NavLink[] = [
  { id: "about", en: "About", zh: "关于" },
  { id: "experience", en: "Experience", zh: "经历" },
  { id: "projects", en: "Projects", zh: "项目" },
  { id: "world", en: "World", zh: "世界" },
  { id: "cv", en: "CV", zh: "简历" },
  { id: "contact", en: "Contact", zh: "联系" },
  { id: "blogs", en: "Blogs", zh: "博客", href: "#/blog" },
];

const isBlogRoute = (hash: string) => hash.startsWith("#/blog");

// ============================================================
// Component
// ============================================================

export default function Navbar() {
  const { lang, setLang, theme, toggleTheme, t } = useApp();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBlogPage, setIsBlogPage] = useState(() =>
    typeof window !== "undefined"
      ? isBlogRoute(window.location.hash)
      : false
  );

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // ----------------------------------------------------------
  // Scroll state
  // ----------------------------------------------------------

  useEffect(() => {
    const handleScroll = () => {
      const nextState = window.scrollY > 20;

      setIsScrolled((previous) =>
        previous === nextState ? previous : nextState
      );
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // ----------------------------------------------------------
  // Route state
  // Only distinguish Blog route from Homepage.
  // ----------------------------------------------------------

  useEffect(() => {
    const updateRoute = () => {
      setIsBlogPage(isBlogRoute(window.location.hash));
    };

    window.addEventListener("hashchange", updateRoute);
    window.addEventListener("popstate", updateRoute);

    updateRoute();

    return () => {
      window.removeEventListener("hashchange", updateRoute);
      window.removeEventListener("popstate", updateRoute);
    };
  }, []);

  // ----------------------------------------------------------
  // Mobile menu
  // ----------------------------------------------------------

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;

    const previousOverflow = document.body.style.overflow;

    // Prevent background scrolling.
    document.body.style.overflow = "hidden";

    // Focus the first menu link.
    const menu = mobileMenuRef.current;
    const firstLink = menu?.querySelector<HTMLElement>("a");

    firstLink?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      // Keep keyboard focus inside the mobile menu.
      if (event.key !== "Tab" || !menu) return;

      const focusableElements =
        menu.querySelectorAll<HTMLElement>("a[href]");

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen, closeMenu]);

  // ----------------------------------------------------------
  // Navigation
  // ----------------------------------------------------------

  const handleHomeClick = () => {
    if (isBlogPage) {
      window.location.hash = "#about";
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const toggleLanguage = () => {
    setLang(lang === "en" ? "zh" : "en");
  };

  // ----------------------------------------------------------
  // Navigation links
  // ----------------------------------------------------------

  const renderNavLinks = (isMobile = false) => (
    <ul
      className={
        isMobile
          ? "flex flex-col gap-6"
          : "flex items-center gap-7"
      }
    >
      {NAV_LINKS.map((link, index) => {
        const isActive = link.id === "blogs" && isBlogPage;

        return (
          <li key={link.id}>
            <a
              href={link.href ?? `#${link.id}`}
              onClick={isMobile ? closeMenu : undefined}
              aria-current={isActive ? "page" : undefined}
              tabIndex={isMobile && !isMenuOpen ? -1 : undefined}
              style={
                isMobile
                  ? {
                      transitionDelay: isMenuOpen
                        ? `${index * 45}ms`
                        : "0ms",
                    }
                  : undefined
              }
              className={
                isMobile
                  ? `
                    group flex items-center justify-between
                    border-b border-line/70 pb-3
                    transition-all duration-300 ease-out
                    ${
                      isMenuOpen
                        ? "translate-x-0 opacity-100"
                        : "translate-x-2 opacity-0"
                    }
                  `
                  : `
                    group/navitem relative px-1 py-2
                    text-[13px] font-medium tracking-wide
                    transition-colors duration-200
                    ${
                      isActive
                        ? "text-accent"
                        : "text-ink-muted hover:text-ink-bold"
                    }
                  `
              }
            >
              <span
                className={
                  isMobile
                    ? `
                      font-serif text-xl font-medium
                      transition-colors duration-200
                      ${
                        isActive
                          ? "text-accent"
                          : "text-ink-bold group-hover:text-accent"
                      }
                    `
                    : ""
                }
              >
                {t(link)}
              </span>

              {isMobile ? (
                <span
                  className={`text-xs ${
                    isActive ? "text-accent" : "text-ink-muted"
                  }`}
                >
                  {isActive ? "↗" : ""}
                </span>
              ) : (
                <span
                  className={`
                    absolute bottom-0 left-0 h-px w-full
                    origin-left bg-accent
                    transition-transform duration-300 ease-out
                    ${
                      isActive
                        ? "scale-x-100"
                        : "scale-x-0 group-hover/navitem:scale-x-100"
                    }
                  `}
                />
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  return (
    <>
      {/* Mobile overlay */}
      <button
        type="button"
        aria-label="Close navigation menu"
        tabIndex={isMenuOpen ? 0 : -1}
        aria-hidden={!isMenuOpen}
        onClick={closeMenu}
        className={`
          fixed inset-0 z-40 lg:hidden
          bg-black/30 backdrop-blur-[2px]
          transition-opacity duration-300
          ${
            isMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }
        `}
      />

      {/* Navbar */}
      <nav
        aria-label="Main navigation"
        className={`
          fixed top-0 z-50 w-full
          border-b
          transition-all duration-300 ease-out
          ${
            isScrolled
              ? "h-14 bg-canvas/85 backdrop-blur-xl border-line/50"
              : "h-16 bg-transparent border-transparent"
          }
        `}
      >
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6 md:px-16">

          {/* Logo */}
          <button
            type="button"
            onClick={handleHomeClick}
            aria-label="Go to homepage"
            className="
              flex items-center gap-2.5
              text-ink-bold
              transition-colors duration-200
              hover:text-accent
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-accent
              rounded-sm
            "
          >
            <Home size={21} strokeWidth={1.7} />
          </button>

          {/* Right section */}
          <div className="flex items-center gap-5 md:gap-8">

            {/* Desktop navigation */}
            <div className="hidden lg:block">
              {renderNavLinks()}
            </div>

            {/* Utility controls */}
            <div
              className="
                flex items-center gap-3
                border-l border-line/50 pl-4
              "
            >
              {/* Theme toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={
                  theme === "light"
                    ? "Switch to dark mode"
                    : "Switch to light mode"
                }
                title={
                  theme === "light" ? "Dark mode" : "Light mode"
                }
                className="
                  flex h-9 w-9 items-center justify-center
                  rounded-full text-ink-muted
                  transition-all duration-200
                  hover:bg-canvas-sub hover:text-accent
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-accent
                "
              >
                {theme === "light" ? (
                  <Moon size={16} />
                ) : (
                  <Sun size={16} />
                )}
              </button>

              {/* Language toggle */}
              <button
                type="button"
                onClick={toggleLanguage}
                aria-label={
                  lang === "en"
                    ? "Switch language to Chinese"
                    : "Switch language to English"
                }
                className="
                  min-w-8 rounded-md px-2 py-1
                  text-xs font-medium text-ink-muted
                  transition-colors duration-200
                  hover:text-ink-bold
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-accent
                "
              >
                {lang === "en" ? "EN" : "中"}
              </button>

              {/* Mobile menu toggle */}
              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => setIsMenuOpen((open) => !open)}
                aria-label={
                  isMenuOpen ? "Close navigation menu" : "Open navigation menu"
                }
                aria-expanded={isMenuOpen}
                aria-controls="mobile-navigation"
                className="
                  flex h-9 w-9 items-center justify-center
                  rounded-md text-ink-muted
                  transition-colors duration-200
                  hover:text-accent
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-accent
                  lg:hidden
                "
              >
                {isMenuOpen ? (
                  <X size={22} strokeWidth={1.7} />
                ) : (
                  <Menu size={22} strokeWidth={1.7} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile navigation panel */}
        <div
          id="mobile-navigation"
          ref={mobileMenuRef}
          aria-label="Mobile navigation"
          aria-hidden={!isMenuOpen}
          className={`
            absolute inset-x-0 top-full
            max-h-[calc(100dvh-4rem)]
            overflow-y-auto
            border-t border-line
            bg-canvas/95 backdrop-blur-2xl
            transition-all duration-300 ease-out
            lg:hidden
            ${
              isMenuOpen
                ? "translate-y-0 opacity-100 pointer-events-auto"
                : "-translate-y-3 opacity-0 pointer-events-none"
            }
          `}
        >
          <div className="flex flex-col gap-6 px-8 pb-10 pt-10">
            {renderNavLinks(true)}
          </div>
        </div>
      </nav>

      {/* Layout spacer */}
      <div className="h-16 w-full" aria-hidden="true" />
    </>
  );
}
