"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n-provider";
import { fmtDateTime } from "@/lib/date";
import { PortalScaffold, StatCard, type NavItem } from "@/components/portal/portal-scaffold";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Landmark, ShieldCheck, ScrollText, Eye, Lock, Unlock, AlertTriangle, FileCheck } from "lucide-react";
import type { SchemeData } from "@/lib/portal-data";

const STATUS_TONE: Record<string, "default" | "success" | "warning" | "danger"> = {
  SUBMITTED: "warning", APPROVED: "success", VERIFIED: "success", REJECTED: "danger", DRAFT: "default",
};

export function SchemePortal({ data }: { data: SchemeData }) {
  const { lang } = useI18n();
  const router = useRouter();
  const { toast } = useToast();
  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const [revealId, setRevealId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  async function doReveal(vaultId: string) {
    const res = await fetch(`/api/portal/vault/${vaultId}/reveal`, {
      method: "POST",
      body: JSON.stringify({ reason }),
      headers: { "Content-Type": "application/json" },
    });
    const j = await res.json();
    if (res.ok) {
      setRevealed((r) => ({ ...r, [vaultId]: j.revealed }));
      toast({ title: lang === "te" ? "వెల్లడైంది — ఆడిట్ చేయబడింది" : "Revealed — audited", description: `${j.refCode} · ${j.type}` });
      setRevealId(null); setReason("");
      router.refresh();
    } else {
      toast({ title: "Error", description: j.error, variant: "destructive" });
    }
  }

  const nav: NavItem[] = [
    { id: "cases", labelKey: "portal.schemeCases", icon: Landmark, count: data.schemes.length },
    { id: "vault", labelKey: "portal.idCards", icon: ShieldCheck, count: data.vaultEntries.length },
    { id: "history", labelKey: "portal.audit", icon: ScrollText },
  ];

  const sections: Record<string, React.ReactNode> = {
    cases: (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label={lang === "te" ? "మొత్తం కేసులు" : "Total Cases"} value={data.schemes.length} icon={Landmark} />
          <StatCard label={lang === "te" ? "ఆమోదితం" : "Approved"} value={data.schemes.filter((s) => s.status === "APPROVED").length} icon={FileCheck} tone="success" />
          <StatCard label={lang === "te" ? "పెండింగ్" : "Pending"} value={data.schemes.filter((s) => s.status === "SUBMITTED" || s.status === "DRAFT").length} icon={AlertTriangle} tone="warning" />
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>{lang === "te" ? "విద్యార్థి" : "Student"}</TableHead><TableHead>{lang === "te" ? "పథకం" : "Scheme"}</TableHead><TableHead>{lang === "te" ? "స్థితి" : "Status"}</TableHead><TableHead>Aadhaar</TableHead><TableHead>Bank</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.schemes.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.student.name}</TableCell>
                    <TableCell>{s.schemeName}</TableCell>
                    <TableCell><Badge variant={STATUS_TONE[s.status] ?? "default"}>{s.status}</Badge></TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{s.aadhaarRef ?? "—"}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{s.bankRef ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    ),
    vault: (
      <div className="space-y-4">
        <div className="flex items-start gap-2 rounded-md border border-red-300/50 bg-red-50 p-3 text-xs text-red-900 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-200">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{lang === "te" ? "పరిమిత డేటా: ఆధార్/బ్యాంక్ సమాచారం పథక-ఆధారిత అధికారం మాత్రమే. ప్రతి వెల్లడి ఆడిట్ చేయబడుతుంది." : "Restricted data: Aadhaar/bank info is scheme-authorised only. Every reveal is audited."}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {data.vaultEntries.map((v) => (
            <Card key={v.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {v.type === "AADHAAR" ? <ShieldCheck className="h-4 w-4 text-primary" /> : <Landmark className="h-4 w-4 text-primary" />}
                    <div>
                      <p className="text-sm font-semibold">{v.student.name}</p>
                      <p className="text-xs text-muted-foreground">{v.student.admissionNo}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{v.type}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground">Reference</p>
                    <p className="font-mono text-sm">{v.refCode}</p>
                  </div>
                  {revealed[v.id] ? (
                    <div className="max-w-[55%]">
                      <p className="text-[10px] uppercase text-muted-foreground">{lang === "te" ? "వెల్లడైన విలువ" : "Revealed value"}</p>
                      <p className="font-mono text-xs font-bold text-green-700 dark:text-green-300">{revealed[v.id]}</p>
                    </div>
                  ) : (
                    <Dialog open={revealId === v.id} onOpenChange={(o) => { setRevealId(o ? v.id : null); setReason(""); }}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => setRevealId(v.id)}>
                          <Unlock className="mr-1 h-3.5 w-3.5" />{lang === "te" ? "వెల్లడించు" : "Reveal"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle className="flex items-center gap-2"><Eye className="h-4 w-4" />{lang === "te" ? "పరిమిత డేటా వెల్లడి" : "Reveal Restricted Data"}</DialogTitle></DialogHeader>
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">{lang === "te" ? `మీరు ${v.type} (${v.refCode}) వెల్లడించబోతున్నారు. ఇది ఆడిట్ చేయబడుతుంది.` : `You are about to reveal ${v.type} (${v.refCode}). This will be audited.`}</p>
                          <div><Label>{lang === "te" ? "కారణం (తప్పనిసరి)" : "Reason (required)"}</Label><Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder={lang === "te" ? "ఉదా: అమ్మ ఒడి బ్యాంక్ ధృవీకరణ" : "e.g. Amma Vodi bank verification"} /></div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => { setRevealId(null); setReason(""); }}>{lang === "te" ? "రద్దు" : "Cancel"}</Button>
                          <Button onClick={() => doReveal(v.id)} disabled={reason.length < 4}><Unlock className="mr-1.5 h-4 w-4" />{lang === "te" ? "వెల్లడించు" : "Reveal & Audit"}</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    ),
    history: (
      <Card>
        <CardHeader><CardTitle className="text-base">{lang === "te" ? "వెల్లడి చరిత్ర" : "Reveal History"}</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>{lang === "te" ? "సమయం" : "Time"}</TableHead><TableHead>{lang === "te" ? "విద్యార్థి" : "Student"}</TableHead><TableHead>{lang === "te" ? "చర్య" : "Action"}</TableHead><TableHead>{lang === "te" ? "కారణం" : "Reason"}</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.accessLogs.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground">{lang === "te" ? "ఇంకా వెల్లడులు లేవు." : "No reveals yet."}</TableCell></TableRow>}
              {data.accessLogs.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="text-xs">{fmtDateTime(l.accessedAt)}</TableCell>
                  <TableCell className="text-sm">{l.vault.student.name}</TableCell>
                  <TableCell><Badge variant={l.action === "REVEAL_VALUE" ? "destructive" : "secondary"}>{l.action}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{l.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    ),
  };

  return (
    <PortalScaffold
      nav={nav}
      sections={sections}
      title={lang === "te" ? "పథక ఆపరేటర్ పోర్టల్" : "Scheme Operator Portal"}
      subtitle={lang === "te" ? "పరిమిత డేటా వర్క్‌ఫ్లో — ఆడిట్ చేయబడిన వెల్లడులు" : "Restricted-data workflow — audited reveals"}
    />
  );
}
