import type { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
};

export function FormField({ label, hint, className, children }: FormFieldProps) {
  return (
    <div className={className ? `space-y-2 ${className}` : "space-y-2"}>
      <div className="space-y-1">
        <p className="text-[13px] text-foreground">{label}</p>
        {hint ? <p className="text-[12px] leading-[1.6] text-muted">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}
