// src/context/AppContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";

type Lang = "en" | "zh";
type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "pzq-theme";

const getSystemTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const readStoredTheme = (): Theme | null => {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    return null;
  }
};

const getInitialTheme = (): Theme => readStoredTheme() ?? getSystemTheme();

// 站点 i18n 文案：双语对象或原样字符串
export interface I18nText {
  en: string;
  zh: string;
}
type Translatable = I18nText | string | null | undefined;

interface AppContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: Theme;
  toggleTheme: () => void;
  t: (obj: Translatable) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>("en");
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // 应用主题到根元素，并同步浏览器原生控件配色
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
  }, [theme]);

  // 没有显式选择时，跟随系统深浅色变化
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => {
      if (readStoredTheme() !== null) return;
      setTheme(event.matches ? "dark" : "light");
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  // 多标签页之间同步主题选择
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;

      if (event.newValue === "light" || event.newValue === "dark") {
        setTheme(event.newValue);
      } else if (event.newValue === null) {
        setTheme(getSystemTheme());
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // localStorage 不可用时仍然允许本次切换
    }

    setTheme(nextTheme);
  };

  // 核心翻译函数，支持直接传入 I18nText 对象
  const t = (obj: Translatable): string => {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj[lang] || "";
  };

  return (
    <AppContext.Provider value={{ lang, setLang, theme, toggleTheme, t }}>
      {children}
    </AppContext.Provider>
  );
};

// 自定义钩子，方便组件调用
// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};