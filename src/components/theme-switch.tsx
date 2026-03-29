"use client";

import { useTheme } from "@/components/theme-provider";
import { FaSun, FaMoon } from "react-icons/fa";

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-[12px] text-foreground transition hover:bg-surface-strong"
      aria-label="Toggle Theme"
    >
      <span className="text-muted">{theme === "dark" ? "Light" : "Dark"}</span>
      <span className="flex size-7 items-center justify-center rounded-full border border-border bg-surface-strong">
        {theme === "dark" ? <FaSun size={12} /> : <FaMoon size={12} />}
      </span>
    </button>
  );
}
