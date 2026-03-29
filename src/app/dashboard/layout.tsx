import { DashboardProviders } from "@/components/dashboard/DashboardProviders";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { Sidebar } from "@/components/dashboard/Sidebar";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProviders>
      <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 14% 8%, rgba(255,255,255,0.06), transparent 16%), radial-gradient(circle at 86% 12%, rgba(255,255,255,0.05), transparent 14%), linear-gradient(180deg, var(--background) 0%, color-mix(in srgb, var(--surface) 92%, transparent) 24%, color-mix(in srgb, var(--surface-strong) 92%, transparent) 48%, color-mix(in srgb, var(--panel) 72%, var(--background) 28%) 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-[16rem] h-[26rem] blur-3xl"
          style={{
            background:
              "linear-gradient(130deg, color-mix(in srgb, var(--panel) 18%, transparent) 0%, color-mix(in srgb, var(--panel-strong) 38%, transparent) 54%, color-mix(in srgb, var(--surface) 18%, transparent) 100%)",
          }}
        />

        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1680px] gap-0 px-4 py-4 sm:px-5 lg:px-6 lg:py-6">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden lg:pl-2">
            <main className="flex-1 space-y-4 overflow-y-auto">
              <DashboardTopbar />
              <div className="rounded-[32px] border border-border/70 bg-[rgba(255,255,255,0.03)] px-4 py-5 shadow-[0_28px_80px_rgba(0,0,0,0.16)] backdrop-blur-sm sm:px-5 sm:py-6 lg:min-h-[calc(100vh-3rem)] lg:px-8 lg:py-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </DashboardProviders>
  );
}
