"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  buildConsentCookie,
  type ConsentStatus,
} from "@/lib/consent";

type ConsentContextValue = {
  consentStatus: ConsentStatus;
  acceptCookies: () => void;
  rejectCookies: () => void;
  reopenConsent: () => void;
};

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined);

function persistConsent(status: Exclude<ConsentStatus, "pending">) {
  document.cookie = buildConsentCookie(status);
}

export function ConsentProvider({
  children,
  initialConsentStatus,
}: {
  children: ReactNode;
  initialConsentStatus: ConsentStatus;
}) {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>(initialConsentStatus);

  const value = useMemo(
    () => ({
      consentStatus,
      acceptCookies: () => {
        persistConsent("accepted");
        setConsentStatus("accepted");
      },
      rejectCookies: () => {
        persistConsent("rejected");
        setConsentStatus("rejected");
      },
      reopenConsent: () => {
        setConsentStatus("pending");
      },
    }),
    [consentStatus]
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const context = useContext(ConsentContext);

  if (!context) {
    throw new Error("useConsent must be used within ConsentProvider");
  }

  return context;
}
