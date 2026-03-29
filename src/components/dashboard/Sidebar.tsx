"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ThemeSwitch } from "@/components/theme-switch";
import { getDashboardNavItems } from "@/components/dashboard/navigation";
import { FaArrowRight, FaRegUser, FaSignOutAlt } from "react-icons/fa";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const navItems = getDashboardNavItems(session?.user?.role);

  return (
    <aside className="sticky top-0 hidden h-[calc(100vh-3rem)] w-[280px] shrink-0 px-5 lg:flex">
      <div className="flex h-full w-full flex-col rounded-[32px] border border-border/80 bg-surface/95 p-5 shadow-[0_22px_60px_rgba(0,0,0,0.22)] backdrop-blur-sm">
        <div className="rounded-[24px] border border-border/70 bg-[rgba(255,255,255,0.03)] p-4">
          <p className="text-[12px] uppercase tracking-[0.24em] text-muted">
            Dashboard
          </p>
          <h1 className="mt-3 text-[28px] font-semibold leading-none text-foreground">
            Vault
          </h1>
          <p className="mt-3 text-[13px] leading-[1.6] text-muted">
            Workspace for prompts, metadata and review-ready content.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong px-4 py-2 text-[12px] text-foreground transition hover:bg-panel"
          >
            <span>Open public site</span>
            <FaArrowRight size={10} />
          </Link>
        </div>

        <nav className="mt-6 flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between gap-3 rounded-[20px] px-4 py-3 transition ${
                  isActive
                    ? "bg-surface-strong text-foreground shadow-[0_18px_35px_rgba(0,0,0,0.16)]"
                    : "text-muted hover:bg-[rgba(255,255,255,0.04)] hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`flex size-9 items-center justify-center rounded-full border ${
                      isActive
                        ? "border-border bg-surface text-foreground"
                        : "border-border/80 bg-transparent text-muted"
                    }`}
                  >
                    <Icon size={14} />
                  </span>
                  <span className="text-[14px]">{item.name}</span>
                </span>
                {isActive && (
                  <span className="text-[11px] uppercase tracking-[0.18em] text-muted">
                    Open
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-4 border-t border-border/70 pt-5">
          <div className="flex items-center justify-between gap-3 rounded-[24px] border border-border/70 bg-[rgba(255,255,255,0.03)] px-4 py-3">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
                Account
              </p>
              <p className="truncate text-[14px] text-foreground">
                {session?.user?.name || "User"}
              </p>
            </div>
            <span className="flex size-10 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-strong text-foreground">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt="User avatar"
                  width={40}
                  height={40}
                  className="size-full object-cover"
                />
              ) : (
                <FaRegUser size={14} />
              )}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <ThemeSwitch />
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-[12px] text-muted transition hover:text-foreground"
            >
              <FaSignOutAlt size={12} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
