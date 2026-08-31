"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/lib/i18n-provider";
import { LangToggle } from "@/components/lang-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { GraduationCap, Menu, LogIn } from "lucide-react";

const NAV: { key: string; href: string }[] = [
  { key: "nav.about", href: "#about" },
  { key: "nav.academics", href: "#academics" },
  { key: "nav.staff", href: "#staff" },
  { key: "nav.facilities", href: "#facilities" },
  { key: "nav.notices", href: "#notices" },
  { key: "nav.achievements", href: "#achievements" },
  { key: "nav.ssc", href: "#ssc" },
  { key: "nav.contact", href: "#contact" },
];

export function SiteHeader({ schoolName }: { schoolName: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight sm:text-[15px]">{schoolName}</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              AP School Digital Platform
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <a
              key={n.key}
              href={n.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {t(n.key)}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <LangToggle />
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/login">
              <LogIn className="mr-1.5 h-4 w-4" />
              {t("nav.portal")}
            </Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <SheetHeader>
                <SheetTitle className="text-left">{schoolName}</SheetTitle>
              </SheetHeader>
              <nav className="mt-4 flex flex-col gap-1">
                {NAV.map((n) => (
                  <a
                    key={n.key}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {t(n.key)}
                  </a>
                ))}
                <Button asChild className="mt-3" size="sm">
                  <Link href="/login">
                    <LogIn className="mr-1.5 h-4 w-4" />
                    {t("nav.portal")}
                  </Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
