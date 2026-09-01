"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fmtDate } from "@/lib/date";

export interface NoticeBrief {
  id: string;
  title: string;
  titleTe?: string | null;
  category: string;
  publishedAt: string | Date | null;
}

export function NotificationBell({ notices, lang }: { notices: NoticeBrief[]; lang: "en" | "te" }) {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  // Persist read state in localStorage.
  useEffect(() => {
    try {
      const stored = localStorage.getItem("zphs_read_notices");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setReadIds(new Set(JSON.parse(stored)));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("zphs_read_notices", JSON.stringify([...readIds])); } catch {}
  }, [readIds]);

  // Close on outside click.
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const unread = notices.filter((n) => !readIds.has(n.id));
  const count = unread.length;

  function markAllRead() {
    setReadIds(new Set(notices.map((n) => n.id)));
  }

  function pickTitle(n: NoticeBrief) {
    return lang === "te" && n.titleTe ? n.titleTe : n.title;
  }

  return (
    <div className="relative" ref={ref}>
      <Button variant="ghost" size="icon" aria-label="Notifications" onClick={() => setOpen((o) => !o)} className="relative">
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </Button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-sm font-semibold">{lang === "te" ? "సూచనలు" : "Notifications"}</span>
            {count > 0 && (
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={markAllRead}>
                <CheckCheck className="mr-1 h-3 w-3" />{lang === "te" ? "అన్నీ చదివినట్లు" : "Mark all read"}
              </Button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto scroll-thin">
            {notices.length === 0 && <p className="p-4 text-center text-xs text-muted-foreground">{lang === "te" ? "సూచనలు లేవు" : "No notices"}</p>}
            {notices.slice(0, 10).map((n) => {
              const isUnread = !readIds.has(n.id);
              return (
                <button
                  key={n.id}
                  onClick={() => setReadIds((s) => new Set([...s, n.id]))}
                  className={`flex w-full items-start gap-2 border-b border-border p-2.5 text-left transition-colors hover:bg-accent ${isUnread ? "bg-primary/5" : ""}`}
                >
                  <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${isUnread ? "bg-primary" : "bg-transparent"}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[9px]">{n.category}</Badge>
                      {n.publishedAt && <span className="text-[10px] text-muted-foreground">{fmtDate(n.publishedAt, "en-GB", { day: "2-digit", month: "short" })}</span>}
                    </div>
                    <p className="mt-0.5 truncate text-xs font-medium">{pickTitle(n)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
