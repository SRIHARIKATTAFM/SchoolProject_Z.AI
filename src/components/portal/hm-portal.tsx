"use client";

import { useState, useTransition } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard, Users, GraduationCap, CalendarCheck, BookOpen, FileText, IdCard,
  Landmark, Megaphone, BarChart3, ScrollText, CheckCircle2, XCircle, Clock, Printer,
  ShieldAlert, AlertTriangle, UserCog, Crown, ArrowRightLeft, CalendarDays, Download, Sparkles,
} from "lucide-react";
import type { HmData } from "@/lib/portal-data";
import { IssuanceDesk, type StudentLite, type RequestLite } from "@/components/portal/issuance-desk";
import { StaffManager, HMHandoverPanel, type StaffLite } from "@/components/portal/staff-manager";
import { SectionChangeButton } from "@/components/portal/section-change-button";
import { AttendanceTrendChart, AttendanceBreakdownChart, AttendancePie, useMonthlyAttendance } from "@/components/portal/attendance-charts";
import { exportCSV, exportPDF, pdfTable } from "@/lib/export";

const STATUS_TONE: Record<string, "default" | "success" | "warning" | "danger"> = {
  SUBMITTED: "warning",
  APPROVED: "success",
  PRINTED: "default",
  ISSUED: "success",
  REJECTED: "danger",
  DRAFT: "default",
  VERIFIED: "success",
};

export function HmPortal({ data, operatorId }: { data: HmData; operatorId: string }) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const schoolLite = data.school
    ? { id: data.school.id, name: data.school.name, nameTe: data.school.nameTe, udise: data.school.udise, address: data.school.address, phone: data.school.phone, email: data.school.email }
    : { id: "", name: "ZPHS Kunaparajuparva", nameTe: null, udise: "—", address: "—", phone: "—", email: "—" };

  // notice form
  const [nTitle, setNTitle] = useState("");
  const [nContent, setNContent] = useState("");
  const [nCategory, setNCategory] = useState("GENERAL");

  const nav: NavItem[] = [
    { id: "dashboard", labelKey: "portal.dashboard", icon: LayoutDashboard },
    { id: "students", labelKey: "portal.students", icon: Users, count: data.stats.totalStudents },
    { id: "staff", labelKey: "portal.staff", icon: GraduationCap, count: data.stats.totalStaff },
    { id: "roles", labelKey: "portal.roles", icon: UserCog },
    { id: "handover", labelKey: "portal.handover", icon: Crown },
    { id: "attendance", labelKey: "portal.attendance", icon: CalendarCheck },
    { id: "academics", labelKey: "portal.academics", icon: BookOpen },
    { id: "timetable", labelKey: "portal.timetable", icon: CalendarDays },
    { id: "exams", labelKey: "portal.exams", icon: FileText },
    { id: "idcards", labelKey: "portal.idCards", icon: IdCard, count: data.stats.pendingIdApprovals },
    { id: "schemes", labelKey: "portal.schemes", icon: Landmark },
    { id: "notices", labelKey: "portal.notices", icon: Megaphone },
    { id: "reports", labelKey: "portal.reports", icon: BarChart3 },
    { id: "audit", labelKey: "portal.audit", icon: ScrollText },
  ];

  async function approve(id: string) {
    const res = await fetch(`/api/portal/id-card/${id}/approve`, { method: "POST" });
    const j = await res.json();
    toast({ title: res.ok ? (lang === "te" ? "ఆమోదించబడింది" : "Approved") : "Error", description: j.error, variant: res.ok ? "default" : "destructive" });
    if (res.ok) router.refresh();
  }
  async function reject(id: string, reason: string) {
    const res = await fetch(`/api/portal/id-card/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }), headers: { "Content-Type": "application/json" } });
    const j = await res.json();
    toast({ title: res.ok ? (lang === "te" ? "తిరస్కరించబడింది" : "Rejected") : "Error", description: j.error, variant: res.ok ? "default" : "destructive" });
    if (res.ok) { setRejectId(null); setRejectReason(""); router.refresh(); }
  }
  async function publishNotice() {
    startTransition(async () => {
      const res = await fetch("/api/portal/notices", {
        method: "POST",
        body: JSON.stringify({ title: nTitle, content: nContent, category: nCategory, schoolId: data.schoolId }),
        headers: { "Content-Type": "application/json" },
      });
      const j = await res.json();
      toast({ title: res.ok ? (lang === "te" ? "ప్రచురించబడింది" : "Published") : "Error", description: j.error, variant: res.ok ? "default" : "destructive" });
      if (res.ok) { setNTitle(""); setNContent(""); setNCategory("GENERAL"); router.refresh(); }
    });
  }

  const sections: Record<string, React.ReactNode> = {
    dashboard: (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label={lang === "te" ? "మొత్తం విద్యార్థులు" : "Total Students"} value={data.stats.totalStudents} icon={Users} />
          <StatCard label={lang === "te" ? "ఉపాధ్యాయులు" : "Staff"} value={data.stats.totalStaff} icon={GraduationCap} />
          <StatCard label={lang === "te" ? "హాజరు రేటు" : "Attendance Rate"} value={`${data.stats.attendanceRate}%`} icon={CalendarCheck} tone={data.stats.attendanceRate > 85 ? "success" : "warning"} />
          <StatCard label={lang === "te" ? "పెండింగ్ ID ఆమోదాలు" : "Pending ID Approvals"} value={data.stats.pendingIdApprovals} icon={IdCard} tone={data.stats.pendingIdApprovals > 0 ? "warning" : "success"} />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="h-4 w-4 text-amber-500" />{lang === "te" ? "చర్య అవసరం" : "Action Required"}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {data.idRequests.filter((r) => r.status === "SUBMITTED").slice(0, 4).map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-md border border-border p-2.5">
                  <div>
                    <p className="text-sm font-medium">{r.student.name}</p>
                    <p className="text-xs text-muted-foreground">{r.cardType} · {lang === "te" ? "ఆమోదం కోసం" : "awaiting approval"}</p>
                  </div>
                  <Button size="sm" onClick={() => approve(r.id)}><CheckCircle2 className="mr-1 h-3.5 w-3.5" />{lang === "te" ? "ఆమోదించు" : "Approve"}</Button>
                </div>
              ))}
              {data.idRequests.filter((r) => r.status === "SUBMITTED").length === 0 && <p className="text-sm text-muted-foreground">{lang === "te" ? "పెండింగ్ ఆమోదాలు లేవు." : "No pending approvals."}</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Landmark className="h-4 w-4 text-primary" />{lang === "te" ? "పథకాల సారాంశం" : "Scheme Summary"}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(data.schemes.reduce((acc, s) => { acc[s.schemeName] = (acc[s.schemeName] ?? 0) + 1; return acc; }, {} as Record<string, number>)).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{k}</span>
                  <Badge variant="secondary">{v}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    ),
    students: (
      <Card>
        <CardContent className="overflow-x-auto p-0 scroll-thin">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{lang === "te" ? "అడ్మిషన్ నెం." : "Adm. No."}</TableHead>
                <TableHead>{lang === "te" ? "పేరు" : "Name"}</TableHead>
                <TableHead>{lang === "te" ? "తరగతి" : "Class"}</TableHead>
                <TableHead>{lang === "te" ? "లింగం" : "Gender"}</TableHead>
                <TableHead>{lang === "te" ? "మాధ్యమం" : "Medium"}</TableHead>
                <TableHead>{lang === "te" ? "వర్గం" : "Category"}</TableHead>
                <TableHead>{lang === "te" ? "విభాగం" : "Section"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.students.slice(0, 60).map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs">{s.admissionNo}</TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.enrolments[0]?.className ?? "—"}-{s.enrolments[0]?.section ?? ""}</TableCell>
                  <TableCell>{s.gender}</TableCell>
                  <TableCell>{s.medium}</TableCell>
                  <TableCell>{s.category ?? "—"}</TableCell>
                  <TableCell><SectionChangeButton studentId={s.id} currentSection={s.enrolments[0]?.section ?? "A"} className={s.enrolments[0]?.className ?? "VI"} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    ),
    staff: (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.staff.map((s) => (
          <Card key={s.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {s.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{s.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{s.designation} · {s.subject}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{s.employeeId}</span>
                <Badge variant={s.status === "ACTIVE" ? "default" : "secondary"}>{s.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    ),
    roles: (
      <StaffManager staff={data.staff as unknown as StaffLite[]} schoolId={data.schoolId} operatorId={operatorId} handover={data.handover as any} onboardings={data.onboardings} />
    ),
    handover: (
      <HMHandoverPanel staff={data.staff as unknown as StaffLite[]} schoolId={data.schoolId} operatorId={operatorId} handover={data.handover as any} />
    ),
    attendance: (
      <AttendanceSection data={data} lang={lang} />
    ),
    academics: (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.exams.map((e) => (
          <Card key={e.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{e.name} · {e.className}</p>
                <Badge variant="outline">{e.type.replace("_", " ")}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{e.academicYear}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div><p className="text-muted-foreground">Marks entries</p><p className="font-bold">{e._count.marks}</p></div>
                <div><p className="text-muted-foreground">Hall tickets</p><p className="font-bold">{e._count.hallTickets}</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    ),
    exams: (
      <div className="space-y-4">
        <div className="flex items-start gap-2 rounded-md border border-amber-300/50 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{lang === "te" ? "ఈ వేదిక అంతర్గత పాఠశాల పరీక్షల హాల్ టికెట్లను మాత్రమే జారీ చేస్తుంది. ఇవి అధికారిక AP SSC/DGE హాల్ టికెట్లు కావు." : "This platform issues INTERNAL school examination hall tickets only. These are NOT official AP SSC/DGE hall tickets."}</p>
        </div>
        <Card>
          <CardContent className="overflow-x-auto p-0 scroll-thin">
            <Table>
              <TableHeader><TableRow><TableHead>Exam</TableHead><TableHead>Class</TableHead><TableHead>Hall Tickets</TableHead><TableHead>Type</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.exams.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell>{e.className}-{e.section}</TableCell>
                    <TableCell><Badge variant="secondary">{e._count.hallTickets}</Badge></TableCell>
                    <TableCell><Badge variant="outline">Internal School</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    ),
    timetable: (
      <TimetableSection data={data} lang={lang} />
    ),
    idcards: (
      <div className="space-y-4">
        <div className="flex items-start gap-2 rounded-md border border-amber-300/50 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{lang === "te" ? "స్కూల్ కౌంటర్ డెస్క్ — విద్యార్థిని కనుగొనండి, 2x2 ఫోటో తీయండి, ఐడెంటిటీ కార్డు జారీ చేయండి." : "School counter desk — find a pupil, take a 2x2 photo, issue the identity card."}</p>
        </div>
        <IssuanceDesk students={data.students as unknown as StudentLite[]} requests={data.idRequests as unknown as RequestLite[]} school={schoolLite} operatorId={operatorId} />
      </div>
    ),
    schemes: (
      <Card>
        <CardContent className="overflow-x-auto p-0 scroll-thin">
          <Table>
            <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Scheme</TableHead><TableHead>Status</TableHead><TableHead>Aadhaar Ref</TableHead><TableHead>Bank Ref</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.schemes.slice(0, 30).map((s) => (
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
    ),
    notices: (
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">{lang === "te" ? "కొత్త సూచన ప్రచురించండి" : "Publish New Notice"}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>{lang === "te" ? "శీర్షిక" : "Title"}</Label><Input value={nTitle} onChange={(e) => setNTitle(e.target.value)} /></div>
            <div><Label>{lang === "te" ? "విషయం" : "Content"}</Label><Textarea value={nContent} onChange={(e) => setNContent(e.target.value)} rows={3} /></div>
            <div>
              <Label>{lang === "te" ? "వర్గం" : "Category"}</Label>
              <Select value={nCategory} onValueChange={setNCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["GENERAL", "EXAM", "HOLIDAY", "MEETING", "URGENT", "ADMISSION"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={publishNotice} disabled={pending || !nTitle || !nContent}><Megaphone className="mr-1.5 h-4 w-4" />{lang === "te" ? "ప్రచురించు" : "Publish"}</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">{lang === "te" ? "ఇప్పటివరకు సూచనలు" : "Notices So Far"}</CardTitle></CardHeader>
          <CardContent>
            <div className="max-h-96 space-y-2 overflow-y-auto scroll-thin pr-1">
              {data.notices.map((n) => (
                <div key={n.id} className="rounded-md border border-border p-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{n.title}</p>
                    <Badge variant={n.status === "PUBLISHED" ? "default" : "secondary"}>{n.status}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.category}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    ),
    reports: (
      <ReportsSection data={data} lang={lang} />
    ),
    audit: (
      <Card>
        <CardContent className="overflow-x-auto p-0 scroll-thin">
          <Table>
            <TableHeader><TableRow><TableHead>{lang === "te" ? "సమయం" : "Time"}</TableHead><TableHead>{lang === "te" ? "వినియోగదారు" : "User"}</TableHead><TableHead>{lang === "te" ? "చర్య" : "Action"}</TableHead><TableHead>{lang === "te" ? "వివరాలు" : "Details"}</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.auditLogs.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="text-xs">{fmtDateTime(a.createdAt)}</TableCell>
                  <TableCell className="text-sm">{a.user?.name ?? "—"}</TableCell>
                  <TableCell><Badge variant="outline">{a.action}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{a.details ?? "—"}</TableCell>
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
      title={lang === "te" ? "ప్రధానోపాధ్యాయుల డాష్‌బోర్డ్" : "Headmaster Dashboard"}
      subtitle={lang === "te" ? "పాఠశాల కార్యాచరణల పూర్తి నియంత్రణ" : "Complete school operations control"}
    />
  );
}

// ─── Attendance section with charts + export ──────────────────────────
function AttendanceSection({ data, lang }: { data: HmData; lang: "en" | "te" }) {
  const monthly = useMonthlyAttendance(data.attendance as any);
  const present = data.attendance.filter((a) => a.status === "PRESENT").length;
  const absent = data.attendance.filter((a) => a.status === "ABSENT").length;
  const late = data.attendance.filter((a) => a.status === "LATE").length;

  function exportCSVAttendance() {
    const rows = data.attendance.map((a) => [
      a.studentId, a.className, a.section, a.status, fmtDateTime(a.date),
    ]);
    exportCSV("attendance-records", rows, ["Student ID", "Class", "Section", "Status", "Date"]);
  }

  function exportPDFAttendance() {
    exportPDF("attendance-summary", "Attendance Summary", (doc) => {
      pdfTable(doc, ["Class", "Present", "Absent", "Late", "Rate %"],
        ["VI", "VII", "VIII", "IX", "X"].map((cls) => {
          const recs = data.attendance.filter((a) => a.className === cls);
          const p = recs.filter((a) => a.status === "PRESENT").length;
          const ab = recs.filter((a) => a.status === "ABSENT").length;
          const l = recs.filter((a) => a.status === "LATE").length;
          const r = recs.length > 0 ? Math.round((p / recs.length) * 100) : 0;
          return [cls, p, ab, l, `${r}%`];
        })
      );
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label={lang === "te" ? "హాజరు రేటు" : "Attendance Rate"} value={`${data.stats.attendanceRate}%`} icon={CalendarCheck} tone={data.stats.attendanceRate > 85 ? "success" : "warning"} />
        <StatCard label={lang === "te" ? "మొత్తం రికార్డులు" : "Total Records"} value={data.attendance.length} icon={FileText} />
        <StatCard label={lang === "te" ? "హాజరైనవారు" : "Present"} value={present} icon={CheckCircle2} tone="success" />
        <StatCard label={lang === "te" ? "గైరుహాజరు" : "Absent"} value={absent} icon={XCircle} tone="danger" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={exportCSVAttendance}><Download className="mr-1.5 h-3.5 w-3.5" />{lang === "te" ? "CSV" : "Export CSV"}</Button>
        <Button variant="outline" size="sm" onClick={exportPDFAttendance}><Download className="mr-1.5 h-3.5 w-3.5" />{lang === "te" ? "PDF" : "Export PDF"}</Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">{lang === "te" ? "నెలవారీ హాజరు ట్రెండ్" : "Monthly Attendance Trend"}</CardTitle></CardHeader>
          <CardContent><AttendanceTrendChart data={monthly} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">{lang === "te" ? "నెలవారీ విభజన" : "Monthly Breakdown"}</CardTitle></CardHeader>
          <CardContent><AttendanceBreakdownChart data={monthly} /></CardContent>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">{lang === "te" ? "మొత్తం పంపిణీ" : "Overall Distribution"}</CardTitle></CardHeader>
          <CardContent>
            <AttendancePie data={[
              { name: lang === "te" ? "హాజరు" : "Present", value: present },
              { name: lang === "te" ? "లేట్" : "Late", value: late },
              { name: lang === "te" ? "గైరుహాజరు" : "Absent", value: absent },
            ]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">{lang === "te" ? "తరగతి-వారీ హాజరు" : "Class-wise Attendance"}</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto p-0 scroll-thin">
            <Table>
              <TableHeader><TableRow><TableHead>Class</TableHead><TableHead>Present</TableHead><TableHead>Absent</TableHead><TableHead>Rate</TableHead></TableRow></TableHeader>
              <TableBody>
                {["VI", "VII", "VIII", "IX", "X"].map((cls) => {
                  const recs = data.attendance.filter((a) => a.className === cls);
                  const p = recs.filter((a) => a.status === "PRESENT").length;
                  const rate = recs.length > 0 ? Math.round((p / recs.length) * 100) : 0;
                  return (
                    <TableRow key={cls}>
                      <TableCell className="font-medium">{cls}</TableCell>
                      <TableCell>{p}</TableCell>
                      <TableCell>{recs.filter((a) => a.status === "ABSENT").length}</TableCell>
                      <TableCell><Badge variant={rate > 85 ? "default" : "secondary"}>{rate}%</Badge></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Timetable section with generation + class view ────────────────────
function TimetableSection({ data, lang }: { data: HmData; lang: "en" | "te" }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [selClass, setSelClass] = useState("X");
  const [selSection, setSelSection] = useState("A");

  const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const periods = [1, 2, 3, 4, 5, 6, 7];

  const rows = data.timetables.filter((t) => t.className === selClass && t.section === selSection);

  async function generate() {
    startTransition(async () => {
      const res = await fetch("/api/portal/timetable/generate", {
        method: "POST",
        body: JSON.stringify({ className: selClass, section: selSection }),
        headers: { "Content-Type": "application/json" },
      });
      const j = await res.json();
      toast({
        title: res.ok ? (lang === "te" ? "షెడ్యూల్ జనరేట్ అయింది" : "Timetable generated") : "Error",
        description: res.ok ? `${selClass}-${selSection}: ${j.count} entries` : j.error,
        variant: res.ok ? "default" : "destructive",
      });
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <Label className="text-xs">{lang === "te" ? "తరగతి" : "Class"}</Label>
          <Select value={selClass} onValueChange={setSelClass}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>{["VI", "VII", "VIII", "IX", "X"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">{lang === "te" ? "విభాగం" : "Section"}</Label>
          <Select value={selSection} onValueChange={setSelSection}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>{["A", "B", "C"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button onClick={generate} disabled={pending}>
          <Sparkles className="mr-1.5 h-4 w-4" />{lang === "te" ? "జనరేట్ చేయి" : "Generate Timetable"}
        </Button>
      </div>
      <Card>
        <CardContent className="overflow-x-auto p-0 scroll-thin">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{lang === "te" ? "పీరియడ్" : "Period"}</TableHead>
                {DAYS.map((d) => <TableHead key={d}>{d}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {periods.map((p) => (
                <TableRow key={p}>
                  <TableCell className="font-medium">P{p}</TableCell>
                  {DAYS.map((d) => {
                    const tt = rows.find((t) => t.day === d && t.period === p);
                    return <TableCell key={d} className="text-xs">{tt ? <span className="font-medium">{tt.subject}<br /><span className="text-muted-foreground">{tt.startTime}</span></span> : <span className="text-muted-foreground">—</span>}</TableCell>;
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {rows.length === 0 && <p className="text-sm text-muted-foreground">{lang === "te" ? "ఈ తరగతికి షెడ్యూల్ లేదు. జనరేట్ క్లిక్ చేయండి." : "No timetable for this class. Click Generate."}</p>}
    </div>
  );
}

// ─── Reports section with KPIs + export buttons ────────────────────────
function ReportsSection({ data, lang }: { data: HmData; lang: "en" | "te" }) {
  function exportStudentsCSV() {
    const rows = data.students.map((s) => [s.admissionNo, s.sid ?? "", s.name, s.enrolments[0]?.className ?? "", s.enrolments[0]?.section ?? "", s.gender, s.medium, s.category ?? "", s.bloodGroup ?? ""]);
    exportCSV("students-list", rows, ["Admission No", "SID", "Name", "Class", "Section", "Gender", "Medium", "Category", "Blood Group"]);
  }

  function exportStudentsPDF() {
    exportPDF("students-report", "Student List — ZPHS Kunaparajuparva", (doc) => {
      pdfTable(doc, ["Adm No", "SID", "Name", "Class", "Gender", "Blood"],
        data.students.map((s) => [s.admissionNo, s.sid ?? "", s.name, `${s.enrolments[0]?.className ?? ""}-${s.enrolments[0]?.section ?? ""}`, s.gender, s.bloodGroup ?? "—"])
      );
    });
  }

  function exportMarksCSV() {
    const rows: (string | number)[][] = [];
    data.exams.forEach((e) => {
      e.marks.forEach((m: any) => {
        rows.push([e.name, e.className, m.student.name, m.subject, m.marks, m.maxMarks, m.grade ?? ""]);
      });
    });
    exportCSV("marks-report", rows, ["Exam", "Class", "Student", "Subject", "Marks", "Max", "Grade"]);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label={lang === "te" ? "మొత్తం విద్యార్థులు" : "Total Students"} value={data.stats.totalStudents} icon={Users} />
        <StatCard label={lang === "te" ? "హాజరు రేటు" : "Attendance Rate"} value={`${data.stats.attendanceRate}%`} icon={CalendarCheck} tone="success" />
        <StatCard label={lang === "te" ? "ప్రచురిత సూచనలు" : "Published Notices"} value={data.stats.publishedNotices} icon={Megaphone} />
        <StatCard label={lang === "te" ? "ID కార్డులు జారీ" : "ID Cards Issued"} value={data.idRequests.filter((r) => r.status === "ISSUED").length} icon={IdCard} tone="success" />
        <StatCard label={lang === "te" ? "పథకాలు ఆమోదితం" : "Schemes Approved"} value={data.schemes.filter((s) => s.status === "APPROVED").length} icon={Landmark} />
        <StatCard label={lang === "te" ? "సిబ్బంది" : "Staff"} value={data.stats.totalStaff} icon={GraduationCap} />
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Download className="h-4 w-4" />{lang === "te" ? "డేటా ఎక్స్‌పోర్ట్" : "Data Export"}</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={exportStudentsCSV}><Download className="mr-1.5 h-3.5 w-3.5" />{lang === "te" ? "విద్యార్థుల CSV" : "Students CSV"}</Button>
          <Button variant="outline" size="sm" onClick={exportStudentsPDF}><Download className="mr-1.5 h-3.5 w-3.5" />{lang === "te" ? "విద్యార్థుల PDF" : "Students PDF"}</Button>
          <Button variant="outline" size="sm" onClick={exportMarksCSV}><Download className="mr-1.5 h-3.5 w-3.5" />{lang === "te" ? "మార్కుల CSV" : "Marks CSV"}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
