"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ThemeSwitch } from "@/components/theme-switch";
import { getDashboardNavItems } from "@/components/dashboard/navigation";

export function DashboardTopbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const navItems = getDashboardNavItems(session?.user?.role);

  return (
    <div className="space-y-4 lg:hidden">
      <div className="flex items-center justify-between gap-4 rounded-[24px] border border-border/80 bg-surface px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
        <div className="min-w-0">
          <p className="text-[12px] uppercase tracking-[0.18em] text-muted">
            PromptVault
          </p>
          <p className="truncate text-[15px] text-foreground">
            {session?.user?.name || "Creator workspace"}
          </p>
        </div>
        <ThemeSwitch />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-[13px] transition ${
                isActive
                  ? "border-transparent bg-[#0f0f0e] text-foreground shadow-[0_14px_28px_rgba(0,0,0,0.24)]"
                  : "border-border bg-surface text-muted hover:text-foreground"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
