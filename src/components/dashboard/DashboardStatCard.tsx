import type { ReactNode } from "react";

type DashboardStatCardProps = {
  icon: ReactNode;
  label: string;
  value: string | number;
  description: string;
  action?: ReactNode;
};

export function DashboardStatCard({
  icon,
  label,
  value,
  description,
  action,
}: DashboardStatCardProps) {
  return (
    <div className="rounded-[28px] border border-border/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.015)_100%)] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full border border-border/80 bg-[#0f0f0e] text-foreground">
            {icon}
          </span>
          <div>
            <p className="text-[12px] uppercase tracking-[0.18em] text-muted">
              {label}
            </p>
            <p className="mt-2 text-[36px] font-semibold leading-none text-foreground">
              {value}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-[14px] leading-[1.7] text-muted">
        {description}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
