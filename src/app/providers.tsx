import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { useThemeStore } from "../store/useThemeStore";
export function Providers() {
  const theme = useThemeStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
  return (
    <><Toast /><RouterProvider
      future={{ v7_startTransition: true }}
      router={router}
      fallbackElement={<p className="p-8">Loading TindaPOS…</p>}
    /></>
  );
}
import { Toast } from '../components/common/Toast';

