"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useI18n } from "@/lib/i18n-provider";
import { LangToggle } from "@/components/lang-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, LogOut, Home } from "lucide-react";
import type { Role } from "@/lib/auth";
import { NotificationBell, type NoticeBrief } from "@/components/portal/notification-bell";

const ROLE_LABEL: Record<Role, { en: string; te: string }> = {
  HM: { en: "Headmaster", te: "ప్రధానోపాధ్యాయులు" },
  TEACHER: { en: "Teacher", te: "ఉపాధ్యాయుడు" },
  STUDENT: { en: "Student", te: "విద్యార్థి" },
  PARENT: { en: "Parent", te: "తల్లి/తండ్రి" },
  SCHEME_OPERATOR: { en: "Scheme Operator", te: "పథక ఆపరేటర్" },
  ID_OPERATOR: { en: "ID Card Operator", te: "ఐడి కార్డ్ ఆపరేటర్" },
  MEO: { en: "Mandal (MEO)", te: "మండల్ (MEO)" },
  DEO: { en: "District (DEO)", te: "జిల్లా (DEO)" },
  STATE: { en: "State Admin", te: "రాష్ట్ర నిర్వాహకులు" },
  MINISTER: { en: "Minister / CM", te: "మంత్రి / CM" },
};

export function PortalTopbar({
  name,
  role,
  schoolName,
  notices = [],
}: {
  name: string;
  role: Role;
  schoolName?: string;
  notices?: NoticeBrief[];
}) {
  const { lang } = useI18n();
  const label = ROLE_LABEL[role][lang];
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur">
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
          <GraduationCap className="h-4.5 w-4.5" />
        </span>
        <span className="hidden flex-col leading-tight sm:flex">
          <span className="text-sm font-bold">{schoolName ?? "ZPHS Kunaparajuparva"}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Portal</span>
        </span>
      </Link>

      <div className="ml-auto flex items-center gap-2">
        <Badge variant="secondary" className="hidden gap-1 sm:inline-flex">
          {label}
        </Badge>
        <span className="hidden text-sm font-medium md:inline">{name}</span>
        <NotificationBell notices={notices} lang={lang} />
        <LangToggle />
        <Button asChild variant="ghost" size="icon" aria-label="Home">
          <Link href="/"><Home className="h-4 w-4" /></Link>
        </Button>
        <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut className="mr-1.5 h-4 w-4" />
          <span className="hidden sm:inline">{lang === "te" ? "సైన్ అవుట్" : "Sign out"}</span>
        </Button>
      </div>
    </header>
  );
}
