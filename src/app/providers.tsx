"use client";

import { NextUIProvider } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "@/components/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <ThemeProvider>
      <NextUIProvider navigate={router.push}>
        {children}
      </NextUIProvider>
    </ThemeProvider>
  );
}
