import type { ReactNode } from "react";

type DashboardPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function DashboardPageHeader({
  eyebrow,
  title,
  description,
  action,
}: DashboardPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-3">
        {eyebrow && (
          <p className="text-[12px] uppercase tracking-[0.22em] text-muted">
            {eyebrow}
          </p>
        )}
        <div className="space-y-2">
          <h1 className="text-[32px] font-semibold leading-none text-foreground md:text-[40px]">
            {title}
          </h1>
          {description && (
            <p className="max-w-[50rem] text-[14px] leading-[1.7] text-muted md:text-[15px]">
              {description}
            </p>
          )}
        </div>
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
