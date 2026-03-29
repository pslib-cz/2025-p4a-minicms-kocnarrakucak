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
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_8%,rgba(255,255,255,0.06),transparent_16%),radial-gradient(circle_at_86%_12%,rgba(255,255,255,0.05),transparent_14%),linear-gradient(180deg,#181816_0%,#1d1d1b_24%,#24231f_48%,#2a2823_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-[16rem] h-[26rem] bg-[linear-gradient(130deg,rgba(87,83,76,0.12)_0%,rgba(87,83,76,0.44)_54%,rgba(54,51,46,0.18)_100%)] blur-3xl" />

        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1680px] gap-0 px-4 py-4 sm:px-5 lg:px-6 lg:py-6">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden lg:pl-2">
            <main className="flex-1 space-y-4 overflow-y-auto">
              <DashboardTopbar />
              <div className="rounded-[32px] border border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.015)_100%)] px-4 py-5 shadow-[0_28px_80px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:px-5 sm:py-6 lg:min-h-[calc(100vh-3rem)] lg:px-8 lg:py-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </DashboardProviders>
  );
}
