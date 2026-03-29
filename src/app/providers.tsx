"use client";

import { Suspense } from "react";
import { NextUIProvider } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import { ConsentProvider } from "@/components/consent-provider";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { ConsentBanner } from "@/components/consent-banner";
import type { Theme } from "@/lib/theme";
import type { ConsentStatus } from "@/lib/consent";

export function Providers({
  children,
  initialTheme,
  initialConsentStatus,
}: {
  children: React.ReactNode;
  initialTheme: Theme;
  initialConsentStatus: ConsentStatus;
}) {
  const router = useRouter();

  return (
    <ThemeProvider initialTheme={initialTheme}>
      <ConsentProvider initialConsentStatus={initialConsentStatus}>
        <NextUIProvider navigate={router.push}>
          {children}
          <Suspense fallback={null}>
            <GoogleAnalytics />
          </Suspense>
          <ConsentBanner />
        </NextUIProvider>
      </ConsentProvider>
    </ThemeProvider>
  );
}
