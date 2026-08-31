"use client";

import { useState, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface NavItem {
  id: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

export function PortalScaffold({
  nav,
  sections,
  title,
  subtitle,
}: {
  nav: NavItem[];
  sections: Record<string, ReactNode>;
  title: string;
  subtitle?: string;
}) {
  const { t } = useI18n();
  const [active, setActive] = useState(nav[0]?.id ?? "");

  return (
    <div className="mx-auto flex max-w-[1400px] gap-0">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 border-r border-border bg-background lg:block">
        <ScrollArea className="h-full">
          <nav className="flex flex-col gap-0.5 p-3">
            {nav.map((n) => (
              <button
                key={n.id}
                onClick={() => setActive(n.id)}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active === n.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <n.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{t(n.labelKey)}</span>
                {n.count != null && (
                  <span className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    active === n.id ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {n.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </ScrollArea>
      </aside>

      {/* Mobile section selector */}
      <div className="flex-1">
        <div className="border-b border-border bg-background px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto scroll-thin lg:hidden">
            {nav.map((n) => (
              <button
                key={n.id}
                onClick={() => setActive(n.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  active === n.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                <n.icon className="h-3.5 w-3.5" />
                {t(n.labelKey)}
              </button>
            ))}
          </div>
          <h1 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="p-4 sm:p-6">{sections[active] ?? <p className="text-sm text-muted-foreground">Select a section.</p>}</div>
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const toneCls = {
    default: "bg-primary/10 text-primary",
    success: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    danger: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  }[tone];
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={cn("grid h-8 w-8 place-items-center rounded-md", toneCls)}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
