"use client";

import { useState } from "react";
import { FaCookieBite } from "react-icons/fa";
import { useConsent } from "@/components/consent-provider";

export function ConsentBanner() {
  const { consentStatus, acceptCookies, rejectCookies } = useConsent();
  const [isPinned, setIsPinned] = useState(false);
  const hasAnalyticsId = Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);

  const panelContent = {
    accepted: {
      eyebrow: "Accepted",
      title: "Analytics enabled",
      description: hasAnalyticsId
        ? "Google Analytics pageviews are active. You can switch them off anytime."
        : "Consent is saved, but tracking starts only after you add the GA measurement ID.",
      primaryLabel: "Keep enabled",
      secondaryLabel: "Disable analytics",
    },
    rejected: {
      eyebrow: "Rejected",
      title: "Analytics disabled",
      description: "The site keeps working normally without analytics. You can enable tracking anytime.",
      primaryLabel: "Enable analytics",
      secondaryLabel: "Keep disabled",
    },
    pending: {
      eyebrow: "Pending",
      title: "We use cookies!",
      description: hasAnalyticsId
        ? "We only load Google Analytics after you allow it. The site works normally if you reject."
        : "Consent is ready. Google Analytics starts tracking after you add the measurement ID to the environment.",
      primaryLabel: "Accept analytics",
      secondaryLabel: "Reject",
    },
  }[consentStatus];

  const panelVisibilityClass = isPinned
    ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
    : "pointer-events-none translate-y-2 scale-[0.98] opacity-0 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100";

  return (
    <div className="group fixed bottom-4 right-4 z-30 before:absolute before:bottom-full before:right-0 before:h-4 before:w-[min(92vw,30rem)] before:content-['']">
      <div
        className={[
          "absolute bottom-full right-0 mb-2 w-[min(92vw,30rem)] origin-bottom-right rounded-[24px] border border-border/90 bg-surface/95 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl transition duration-200",
          panelVisibilityClass,
        ].join(" ")}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border/90 bg-surface-strong text-foreground">
              <FaCookieBite size={16} />
            </span>
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-soft">{panelContent.eyebrow}</p>
              <p className="text-[24px] font-medium leading-none text-foreground">{panelContent.title}</p>
              <p className="max-w-[24rem] text-[13px] leading-[1.6] text-muted">{panelContent.description}</p>
            </div>
          </div>

          <div className="rounded-[20px] border border-border/80 bg-[rgba(255,255,255,0.02)] px-4 py-3 text-[12px] leading-[1.7] text-muted">
            Accepted: pageview tracking for analytics.
            <br />
            Rejected: no analytics script, no analytics cookies.
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={rejectCookies}
              className="rounded-full border border-border px-4 py-2 text-[12px] text-muted transition hover:border-foreground/20 hover:text-foreground"
            >
              {panelContent.secondaryLabel}
            </button>
            <button
              type="button"
              onClick={acceptCookies}
              className="rounded-full border border-border bg-surface-strong px-4 py-2 text-[12px] text-foreground transition hover:bg-panel"
            >
              {panelContent.primaryLabel}
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label="Cookie settings"
        aria-expanded={isPinned}
        onClick={() => setIsPinned((value) => !value)}
        className={[
          "inline-flex size-12 items-center justify-center rounded-full border border-border bg-surface/95 text-foreground shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-xl transition",
          isPinned ? "bg-surface-strong" : "hover:bg-surface-strong",
        ].join(" ")}
      >
        <FaCookieBite size={18} />
      </button>
    </div>
  );
}
