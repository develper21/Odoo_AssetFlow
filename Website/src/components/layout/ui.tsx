import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function PageHeader({
  title, subtitle, actions,
}: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function NeuCard({
  className, children,
}: { className?: string; children: ReactNode }) {
  return <div className={cn("neu p-5 md:p-6", className)}>{children}</div>;
}

export function StatCard({
  label, value, delta, tone = "default", icon,
}: {
  label: string; value: string; delta?: string;
  tone?: "default" | "accent"; icon?: ReactNode;
}) {
  return (
    <div className={cn("p-5 md:p-6", tone === "accent" ? "neu-accent" : "neu")}>
      <div className="flex items-start justify-between">
        <div className="text-xs uppercase tracking-wider opacity-80">{label}</div>
        {icon}
      </div>
      <div className="mt-3 font-display text-3xl font-semibold md:text-4xl">{value}</div>
      {delta && <div className="mt-1 text-xs opacity-80">{delta}</div>}
    </div>
  );
}

export function Badge({
  children, tone = "neutral",
}: { children: ReactNode; tone?: "neutral" | "success" | "warn" | "danger" | "primary" }) {
  const tones: Record<string, string> = {
    neutral: "bg-muted text-muted-foreground",
    success: "bg-emerald-500/15 text-emerald-500",
    warn: "bg-amber-500/15 text-amber-500",
    danger: "bg-rose-500/15 text-rose-500",
    primary: "bg-primary/20 text-primary",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", tones[tone])}>
      {children}
    </span>
  );
}

export function toneForStatus(status: string): "neutral" | "success" | "warn" | "danger" | "primary" {
  if (!status) return "neutral";
  const s = status.toLowerCase();
  if (["available", "resolved", "confirmed", "completed", "approved", "returned", "active", "done", "paid"].includes(s)) return "success";
  if (["pending", "planned", "in progress", "assigned", "running"].includes(s)) return "warn";
  if (["retired", "cancelled", "returned late", "failed"].includes(s)) return "danger";
  if (["allocated", "maintenance"].includes(s)) return "primary";
  return "neutral";
}

export function DataTable<T>({
  columns, rows, empty = "No records",
}: {
  columns: { key: string; label: string; render?: (row: T) => ReactNode; className?: string }[];
  rows: T[];
  empty?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            {columns.map((c) => (
              <th key={c.key} className={cn("px-3 py-3 font-medium", c.className)}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-3 py-10 text-center text-muted-foreground">
                {empty}
              </td>
            </tr>
          )}
          {rows.map((row, i) => (
            <tr
              key={i}
              className="neu-sm mb-2 [&>td:first-child]:rounded-l-xl [&>td:last-child]:rounded-r-xl"
              style={{ display: "table-row" }}
            >
              {columns.map((c) => (
                <td key={c.key} className={cn("px-3 py-3 align-middle", c.className)}>
                  {c.render ? c.render(row) : (row as Record<string, ReactNode>)[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
