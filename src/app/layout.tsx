import type { Metadata } from "next";
import { cookies } from "next/headers";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { getSiteUrlObject } from "@/lib/site";
import { parseTheme } from "@/lib/theme";
import { COOKIE_CONSENT_KEY, parseConsentStatus } from "@/lib/consent";

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: getSiteUrlObject(),
  title: {
    default: "PromptVault",
    template: "%s | PromptVault",
  },
  description: "A mini CMS for publishing AI prompts with a public library and creator dashboard.",
  openGraph: {
    title: "PromptVault",
    description: "A mini CMS for publishing AI prompts with a public library and creator dashboard.",
    siteName: "PromptVault",
    type: "website",
  },
  alternates: {
    canonical: "/",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialTheme = parseTheme(cookieStore.get("theme")?.value);
  const initialConsentStatus = parseConsentStatus(cookieStore.get(COOKIE_CONSENT_KEY)?.value);

  return (
    <html
      lang="en"
      className={`${ibmPlexMono.variable} ${initialTheme} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers initialTheme={initialTheme} initialConsentStatus={initialConsentStatus}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
