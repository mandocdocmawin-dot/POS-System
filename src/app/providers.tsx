import { T } from "../i18n/T";
import { PwaUpdate } from '../components/pwa/PwaUpdate';
import { Toast } from "../components/common/Toast";
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { useThemeStore } from "../store/useThemeStore";
import { useLanguageStore } from '../store/useLanguageStore';
export function Providers() {
  const theme = useThemeStore((s) => s.theme);
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  useEffect(() => { void setLanguage(useLanguageStore.getState().language); }, [setLanguage]);
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded focus:bg-white focus:p-3 focus:text-slate-900"><T text={"Skip to main content"}/></a><Toast /><PwaUpdate />
      <RouterProvider
        future={{ v7_startTransition: true }}
        router={router}
        fallbackElement={<p className="p-8"><T text={"Loading TindaPOS…"}/></p>}
      />
    </>
  );
}
