import type { ReactNode } from "react";

type DashboardPanelProps = {
  children: ReactNode;
  className?: string;
};

export function DashboardPanel({ children, className = "" }: DashboardPanelProps) {
  return (
    <section
      className={`rounded-[28px] border border-border/80 bg-surface/90 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.14)] backdrop-blur-sm md:p-6 ${className}`}
    >
      {children}
    </section>
  );
}
