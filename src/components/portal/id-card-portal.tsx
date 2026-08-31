"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n-provider";
import { fmtDate } from "@/lib/date";
import { PortalScaffold, StatCard, type NavItem } from "@/components/portal/portal-scaffold";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { IdCard, Search, Printer, CheckCircle2, Clock, ShieldAlert, UserSearch, Users } from "lucide-react";
import type { IdOperatorData } from "@/lib/portal-data";

const STATUS_TONE: Record<string, "default" | "success" | "warning" | "danger"> = {
  DRAFT: "default", SUBMITTED: "warning", APPROVED: "success", REJECTED: "danger", PRINTED: "default", ISSUED: "success",
};

export function IdCardPortal({ data }: { data: IdOperatorData }) {
  const { lang } = useI18n();
  const router = useRouter();
  const { toast } = useToast();

  async function advance(id: string) {
    const res = await fetch(`/api/portal/id-card/${id}/print`, { method: "POST" });
    const j = await res.json();
    toast({ title: res.ok ? (lang === "te" ? "నవీకరించబడింది" : "Updated") : "Error", description: res.ok ? `${lang === "te" ? "స్థితి" : "Status"}: ${j.request.status}` : j.error, variant: res.ok ? "default" : "destructive" });
    if (res.ok) router.refresh();
  }

  const pending = data.requests.filter((r) => r.status === "APPROVED" || r.status === "PRINTED");
  const issued = data.requests.filter((r) => r.status === "ISSUED");

  const nav: NavItem[] = [
    { id: "search", labelKey: "portal.idCards", icon: UserSearch, count: data.students.length },
    { id: "queue", labelKey: "portal.printQueue", icon: Printer, count: pending.length },
    { id: "issued", labelKey: "portal.idCards", icon: CheckCircle2, count: issued.length },
  ];

  const sections: Record<string, React.ReactNode> = {
    search: (
      <div className="space-y-4">
        <div className="flex items-start gap-2 rounded-md border border-amber-300/50 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{lang === "te" ? "వేరు చేయబడిన బాధ్యతలు: ఆపరేటర్ అభ్యర్థనలను సమర్పిస్తారు — ప్రధానోపాధ్యాయులు మాత్రమే ఆమోదిస్తారు. ఆపరేటర్ తమ స్వంత అభ్యర్థనను ఆమోదించలేరు." : "Separation of duties: Operator submits requests — only the Headmaster approves. The operator cannot approve their own request."}</p>
        </div>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Search className="h-4 w-4" />{lang === "te" ? "విద్యార్థి శోధన" : "Student Search"}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid max-h-[28rem] gap-2 overflow-y-auto scroll-thin sm:grid-cols-2">
              {data.students.map((s) => {
                const req = data.requests.find((r) => r.studentId === s.id);
                return (
                  <div key={s.id} className="flex items-center gap-2.5 rounded-md border border-border p-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">{s.name[0]}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{s.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{s.enrolments[0]?.className}-{s.enrolments[0]?.section} · {s.admissionNo}</p>
                    </div>
                    {req ? <Badge variant={STATUS_TONE[req.status] ?? "default"} className="text-[10px]">{req.status}</Badge> : <Badge variant="outline" className="text-[10px]">{lang === "te" ? "కార్డు లేదు" : "No card"}</Badge>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    ),
    queue: (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label={lang === "te" ? "ప్రింట్ కోసం" : "Ready to Print"} value={data.requests.filter((r) => r.status === "APPROVED").length} icon={Printer} tone="success" />
          <StatCard label={lang === "te" ? "ప్రింట్ అయింది" : "Printed"} value={data.requests.filter((r) => r.status === "PRINTED").length} icon={Clock} />
          <StatCard label={lang === "te" ? "ఆమోదం కోసం" : "Awaiting Approval"} value={data.requests.filter((r) => r.status === "SUBMITTED").length} icon={IdCard} tone="warning" />
        </div>
        <div className="space-y-3">
          {pending.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">{r.student.name[0]}</span>
                  <div>
                    <p className="text-sm font-semibold">{r.student.name}</p>
                    <p className="text-xs text-muted-foreground">{r.student.admissionNo} · {r.cardType}</p>
                    <p className="text-[11px] text-muted-foreground">{lang === "te" ? "ఆమోదించారు" : "Approved by"} {r.approvedBy?.name ?? "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={STATUS_TONE[r.status] ?? "default"}>{r.status}</Badge>
                  <Button size="sm" onClick={() => advance(r.id)}>
                    <Printer className="mr-1 h-3.5 w-3.5" />
                    {r.status === "APPROVED" ? (lang === "te" ? "ప్రింట్" : "Print") : (lang === "te" ? "జారీ" : "Issue")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {pending.length === 0 && <p className="text-sm text-muted-foreground">{lang === "te" ? "ప్రింట్ క్యూలో ఏమీ లేదు." : "Nothing in the print queue."}</p>}
        </div>
      </div>
    ),
    issued: (
      <div className="space-y-3">
        <StatCard label={lang === "te" ? "జారీ అయిన కార్డులు" : "Issued Cards"} value={issued.length} icon={CheckCircle2} tone="success" />
        {issued.map((r) => (
          <Card key={r.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300"><IdCard className="h-4 w-4" /></span>
                <div>
                  <p className="text-sm font-semibold">{r.student.name}</p>
                  <p className="text-xs text-muted-foreground">{r.cardType} · {lang === "te" ? "జారీ" : "Issued"} {r.issuedAt ? fmtDate(r.issuedAt) : "—"}</p>
                </div>
              </div>
              <Badge variant="success">{r.status}</Badge>
            </CardContent>
          </Card>
        ))}
        {issued.length === 0 && <p className="text-sm text-muted-foreground">{lang === "te" ? "జారీ అయిన కార్డులు లేవు." : "No issued cards yet."}</p>}
      </div>
    ),
  };

  return (
    <PortalScaffold
      nav={nav}
      sections={sections}
      title={lang === "te" ? "ID కార్డ్ ఆపరేటర్ పోర్టల్" : "ID Card Operator Portal"}
      subtitle={lang === "te" ? "ఫోటో → అభ్యర్థన → ఆమోదం → ప్రింట్ → జారీ" : "Photo → Request → Approval → Print → Issue"}
    />
  );
}
