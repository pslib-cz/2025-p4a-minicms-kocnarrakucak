"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { useConsent } from "@/components/consent-provider";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function clearGoogleAnalyticsCookies() {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie
    .split(";")
    .map((entry) => entry.trim().split("=")[0])
    .filter((name) => name === "_ga" || name.startsWith("_ga_"))
    .forEach((name) => {
      document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
    });
}

export function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { consentStatus } = useConsent();
  const pagePath = useMemo(() => {
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);
  const lastTrackedPath = useRef(pagePath);

  useEffect(() => {
    if (!measurementId) {
      return;
    }

    const disabledKey = `ga-disable-${measurementId}`;
    const windowWithAnalyticsFlags = window as unknown as Window & Record<string, boolean>;
    windowWithAnalyticsFlags[disabledKey] = consentStatus !== "accepted";

    if (consentStatus !== "accepted") {
      clearGoogleAnalyticsCookies();
    }
  }, [consentStatus]);

  useEffect(() => {
    if (consentStatus !== "accepted" || !measurementId || typeof window.gtag !== "function") {
      return;
    }

    if (lastTrackedPath.current === pagePath) {
      return;
    }

    lastTrackedPath.current = pagePath;
    window.gtag("event", "page_view", {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [consentStatus, pagePath]);

  if (consentStatus !== "accepted" || !measurementId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname + window.location.search,
              page_location: window.location.href,
              send_page_view: true
            });
          `,
        }}
      />
    </>
  );
}
