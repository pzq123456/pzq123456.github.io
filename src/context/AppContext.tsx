// src/context/AppContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";

type Lang = "en" | "zh";
type Theme = "light" | "dark";

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
  const [theme, setTheme] = useState<Theme>("light");

  // 响应式暗黑模式切换
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === "light" ? "dark" : "light");

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