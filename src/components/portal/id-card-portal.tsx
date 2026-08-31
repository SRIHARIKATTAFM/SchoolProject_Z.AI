"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n-provider";
import { PortalScaffold, StatCard, type NavItem } from "@/components/portal/portal-scaffold";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { IdCardStudio, type IDCardRequestLite } from "@/components/portal/id-card-studio";
import { IdCard, Search, Printer, CheckCircle2, Clock, ShieldAlert, UserSearch, Plus } from "lucide-react";
import type { IdOperatorData } from "@/lib/portal-data";

const STATUS_TONE: Record<string, "default" | "success" | "warning" | "danger"> = {
  DRAFT: "default", SUBMITTED: "warning", APPROVED: "success", REJECTED: "danger", PRINTED: "default", ISSUED: "success",
};

export function IdCardPortal({ data }: { data: IdOperatorData }) {
  const { lang } = useI18n();
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [newStudentId, setNewStudentId] = useState("");
  const [newCardType, setNewCardType] = useState("NEW");

  async function advance(id: string) {
    startTransition(async () => {
      const res = await fetch(`/api/portal/id-card/${id}/print`, { method: "POST" });
      const j = await res.json();
      toast({ title: res.ok ? (lang === "te" ? "నవీకరించబడింది" : "Updated") : "Error", description: res.ok ? `${lang === "te" ? "స్థితి" : "Status"}: ${j.request.status}` : j.error, variant: res.ok ? "default" : "destructive" });
      if (res.ok) router.refresh();
    });
  }

  async function createRequest() {
    startTransition(async () => {
      const res = await fetch("/api/portal/id-card", {
        method: "POST",
        body: JSON.stringify({ studentId: newStudentId, schoolId: data.school?.id, cardType: newCardType }),
        headers: { "Content-Type": "application/json" },
      });
      const j = await res.json();
      toast({ title: res.ok ? (lang === "te" ? "అభ్యర్థన సృష్టించబడింది" : "Request created") : "Error", description: j.error, variant: res.ok ? "default" : "destructive" });
      if (res.ok) { setNewOpen(false); setNewStudentId(""); setNewCardType("NEW"); router.refresh(); }
    });
  }

  const filteredStudents = data.students.filter((s) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.admissionNo.toLowerCase().includes(q) || (s.enrolments[0]?.className ?? "").toLowerCase().includes(q);
  });

  const studentsWithRequest = new Set(data.requests.map((r) => r.studentId));

  // For the studio: show APPROVED, PRINTED, ISSUED cards (operator can attach photos pre-approval too)
  const studioRequests = data.requests.slice(0, 8) as unknown as IDCardRequestLite[];

  const nav: NavItem[] = [
    { id: "studio", labelKey: "portal.idCards", icon: IdCard, count: data.requests.length },
    { id: "search", labelKey: "portal.idCards", icon: UserSearch, count: data.students.length },
    { id: "queue", labelKey: "portal.printQueue", icon: Printer, count: data.requests.filter((r) => r.status === "APPROVED" || r.status === "PRINTED").length },
    { id: "issued", labelKey: "portal.idCards", icon: CheckCircle2, count: data.requests.filter((r) => r.status === "ISSUED").length },
  ];

  const sections: Record<string, React.ReactNode> = {
    studio: (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{lang === "te" ? "ఫోటో సవరణ + లైవ్ ID కార్డ్ ప్రివ్యూ" : "Photo adjustment + live ID card preview"}</p>
          <Button size="sm" onClick={() => setNewOpen(true)}><Plus className="mr-1.5 h-4 w-4" />{lang === "te" ? "కొత్త అభ్యర్థన" : "New request"}</Button>
        </div>
        <div className="flex items-start gap-2 rounded-md border border-amber-300/50 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{lang === "te" ? "వేరు చేయబడిన బాధ్యతలు: ఆపరేటర్ ఫోటో తీస్తారు/అభ్యర్థిస్తారు — ప్రధానోపాధ్యాయులు మాత్రమే ఆమోదిస్తారు & జారీ చేస్తారు." : "Separation of duties: Operator captures photo & submits — only the Headmaster approves & issues."}</p>
        </div>
        {studioRequests.length === 0 && <p className="text-sm text-muted-foreground">{lang === "te" ? "ఇంకా అభ్యర్థనలు లేవు." : "No requests yet. Create one from the student search."}</p>}
        <div className="space-y-4">
          {studioRequests.map((r) => (
            <IdCardStudio key={r.id} request={r} school={data.school!} role="ID_OPERATOR" />
          ))}
        </div>
      </div>
    ),
    search: (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={lang === "te" ? "పేరు / అడ్మిషన్ నెం / తరగతి" : "Name / Admission No / Class"} className="max-w-xs" />
          <Button size="sm" onClick={() => setNewOpen(true)}><Plus className="mr-1.5 h-4 w-4" />{lang === "te" ? "కొత్త అభ్యర్థన" : "New request"}</Button>
        </div>
        <div className="grid max-h-[32rem] gap-2 overflow-y-auto scroll-thin sm:grid-cols-2">
          {filteredStudents.map((s) => {
            const req = data.requests.find((r) => r.studentId === s.id);
            return (
              <div key={s.id} className="flex items-center gap-2.5 rounded-md border border-border p-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">{s.name[0]}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{s.enrolments[0]?.className}-{s.enrolments[0]?.section} · {s.admissionNo}</p>
                </div>
                {req ? (
                  <Badge variant={STATUS_TONE[req.status] ?? "default"} className="text-[10px]">{req.status}</Badge>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => { setNewStudentId(s.id); setNewOpen(true); }}>
                    <Plus className="mr-1 h-3 w-3" />{lang === "te" ? "కార్డు" : "Card"}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
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
          {data.requests.filter((r) => r.status === "APPROVED" || r.status === "PRINTED").map((r) => (
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
                  <Button size="sm" onClick={() => advance(r.id)} disabled={pending}>
                    <Printer className="mr-1 h-3.5 w-3.5" />
                    {r.status === "APPROVED" ? (lang === "te" ? "ప్రింట్" : "Print") : (lang === "te" ? "జారీ" : "Issue")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {data.requests.filter((r) => r.status === "APPROVED" || r.status === "PRINTED").length === 0 && <p className="text-sm text-muted-foreground">{lang === "te" ? "ప్రింట్ క్యూలో ఏమీ లేదు." : "Nothing in the print queue."}</p>}
        </div>
      </div>
    ),
    issued: (
      <div className="space-y-3">
        <StatCard label={lang === "te" ? "జారీ అయిన కార్డులు" : "Issued Cards"} value={data.requests.filter((r) => r.status === "ISSUED").length} icon={CheckCircle2} tone="success" />
        {data.requests.filter((r) => r.status === "ISSUED").map((r) => (
          <IdCardStudio key={r.id} request={r as unknown as IDCardRequestLite} school={data.school!} role="ID_OPERATOR" />
        ))}
        {data.requests.filter((r) => r.status === "ISSUED").length === 0 && <p className="text-sm text-muted-foreground">{lang === "te" ? "జారీ అయిన కార్డులు లేవు." : "No issued cards yet."}</p>}
      </div>
    ),
  };

  return (
    <>
      <PortalScaffold
        nav={nav}
        sections={sections}
        title={lang === "te" ? "ID కార్డ్ ఆపరేటర్ పోర్టల్" : "ID Card Operator Portal"}
        subtitle={lang === "te" ? "ఫోటో → అభ్యర్థన → ఆమోదం → ప్రింట్ → జారీ" : "Photo → Request → Approval → Print → Issue"}
      />
      {/* New request dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="h-4 w-4" />{lang === "te" ? "కొత్త ID కార్డు అభ్యర్థన" : "New ID Card Request"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>{lang === "te" ? "విద్యార్థి" : "Student"}</Label>
              <Select value={newStudentId} onValueChange={setNewStudentId}>
                <SelectTrigger><SelectValue placeholder={lang === "te" ? "విద్యార్థిని ఎంచుకోండి" : "Select student"} /></SelectTrigger>
                <SelectContent>
                  {data.students.filter((s) => !studentsWithRequest.has(s.id)).map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} · {s.enrolments[0]?.className}-{s.enrolments[0]?.section} · {s.admissionNo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{lang === "te" ? "కార్డు రకం" : "Card Type"}</Label>
              <Select value={newCardType} onValueChange={setNewCardType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">{lang === "te" ? "కొత్త" : "New"}</SelectItem>
                  <SelectItem value="REPLACEMENT">{lang === "te" ? "భర్తీ" : "Replacement"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>{lang === "te" ? "రద్దు" : "Cancel"}</Button>
            <Button onClick={createRequest} disabled={pending || !newStudentId}><Plus className="mr-1.5 h-4 w-4" />{lang === "te" ? "సృష్టించు" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
