"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n-provider";
import { fmtDate } from "@/lib/date";
import { PortalScaffold, StatCard, type NavItem } from "@/components/portal/portal-scaffold";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Home, BookOpen, CalendarDays, CalendarCheck, ClipboardList, Megaphone, IdCard, User,
  CheckCircle2, Clock, AlertCircle, Download,
} from "lucide-react";
import type { StudentData } from "@/lib/portal-data";
import { AttendanceBreakdownChart, AttendancePie, useMonthlyAttendance } from "@/components/portal/attendance-charts";
import { SubjectPerformanceBar, SubjectRadar, ExamProgressChart, aggregateMarks } from "@/components/portal/performance-charts";
import { Button } from "@/components/ui/button";
import { exportCSV, exportPDF, pdfTable } from "@/lib/export";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function StudentPortal({ data }: { data: NonNullable<StudentData> }) {
  const { lang } = useI18n();
  const { student, enrolment, homework, timetable, notices } = data;

  const attendance = student.attendance;
  const present = attendance.filter((a) => a.status === "PRESENT").length;
  const attRate = attendance.length > 0 ? Math.round((present / attendance.length) * 100) : 0;

  // group marks by exam
  const examMap: Record<string, { subject: string; marks: number; max: number; grade?: string }[]> = {};
  student.marks.forEach((m) => {
    const k = `${m.exam.name} · ${m.exam.className}`;
    if (!examMap[k]) examMap[k] = [];
    examMap[k].push({ subject: m.subject, marks: m.marks, max: m.maxMarks, grade: m.grade ?? undefined });
  });

  // Compute "today" only on the client to avoid SSR/client hydration mismatch.
  const [todayStr, setTodayStr] = useState("");
  const [todayIdx, setTodayIdx] = useState<number | null>(null);
  useEffect(() => {
    const now = new Date();
    // Client-only time computation — eslint-disable to avoid hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTodayStr(now.toLocaleDateString(lang === "te" ? "te-IN" : "en-IN", { weekday: "long", day: "numeric", month: "long" }));
    setTodayIdx(now.getDay());
  }, [lang]);
  const todayKey = todayIdx !== null ? DAYS[(todayIdx + 6) % 7] : null;

  const nav: NavItem[] = [
    { id: "today", labelKey: "portal.today", icon: Home },
    { id: "homework", labelKey: "portal.homework", icon: BookOpen, count: homework.length },
    { id: "timetable", labelKey: "portal.timetable", icon: CalendarDays },
    { id: "attendance", labelKey: "portal.attendance", icon: CalendarCheck },
    { id: "results", labelKey: "portal.results", icon: ClipboardList },
    { id: "announcements", labelKey: "portal.announcements", icon: Megaphone, count: notices.length },
    { id: "idcard", labelKey: "portal.idCards", icon: IdCard },
    { id: "profile", labelKey: "portal.profile", icon: User },
  ];

  const sections: Record<string, React.ReactNode> = {
    today: (
      <div className="space-y-6">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-5">
            <p className="text-sm opacity-90">{todayStr || "—"}</p>
            <h2 className="mt-1 text-2xl font-bold">{lang === "te" ? "నమస్కారం" : "Hello"}, {student.name.split(" ")[0]} 👋</h2>
            <p className="mt-1 text-sm opacity-90">{lang === "te" ? `మీ తరగతి` : "Your class"}: {enrolment?.className}-{enrolment?.section} · {lang === "te" ? "రోల్ నెం." : "Roll"} {student.rollNo}</p>
          </CardContent>
        </Card>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label={lang === "te" ? "హాజరు రేటు" : "Attendance"} value={`${attRate}%`} icon={CalendarCheck} tone={attRate > 85 ? "success" : "warning"} />
          <StatCard label={lang === "te" ? "పెండింగ్ హోంవర్క్" : "Pending Homework"} value={homework.filter((h) => { const sub = student.homeworkSubs.find((s) => s.homeworkId === h.id); return !sub || sub.status === "PENDING"; }).length} icon={BookOpen} />
          <StatCard label={lang === "te" ? "మొత్తం పరీక్షలు" : "Exams"} value={Object.keys(examMap).length} icon={ClipboardList} />
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base">{lang === "te" ? "ఈరోజు షెడ్యూల్" : "Today's Schedule"}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {timetable.filter((tt) => todayKey && (tt.day === todayKey)).slice(0, 5).map((tt) => (
              <div key={tt.id} className="flex items-center gap-3 rounded-md border border-border p-2.5">
                <span className="font-mono text-xs text-muted-foreground">{tt.startTime}–{tt.endTime}</span>
                <span className="text-sm font-medium">{tt.subject}</span>
                <span className="ml-auto text-xs text-muted-foreground">Period {tt.period}</span>
              </div>
            ))}
            {timetable.length === 0 && <p className="text-sm text-muted-foreground">{lang === "te" ? "ఈరోజు షెడ్యూల్ లేదు." : "No schedule today."}</p>}
          </CardContent>
        </Card>
      </div>
    ),
    homework: (
      <div className="space-y-3">
        {homework.map((h) => {
          const sub = student.homeworkSubs.find((s) => s.homeworkId === h.id);
          const status = sub?.status ?? "PENDING";
          return (
            <Card key={h.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{h.title}</p>
                      <Badge variant="outline">{h.subject}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{h.description}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {lang === "te" ? "గడువు" : "Due"}: {fmtDate(h.dueDate, "en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <Badge variant={status === "SUBMITTED" || status === "GRADED" ? "default" : status === "LATE" ? "destructive" : "secondary"}>
                    {status === "SUBMITTED" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                    {status === "PENDING" && <Clock className="mr-1 h-3 w-3" />}
                    {status === "LATE" && <AlertCircle className="mr-1 h-3 w-3" />}
                    {status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    ),
    timetable: (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{lang === "te" ? "పీరియడ్" : "Period"}</TableHead>
                {DAYS.map((d) => <TableHead key={d}>{d}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5, 6, 7].map((p) => (
                <TableRow key={p}>
                  <TableCell className="font-medium">P{p}</TableCell>
                  {DAYS.map((d) => {
                    const tt = timetable.find((t) => t.day === d && t.period === p);
                    return <TableCell key={d} className="text-xs">{tt ? tt.subject : <span className="text-muted-foreground">—</span>}</TableCell>;
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    ),
    attendance: (
      <StudentAttendanceSection attendance={attendance} attRate={attRate} present={present} lang={lang} />
    ),
    results: (
      (() => {
        const allMarks: any[] = [];
        Object.entries(examMap).forEach(([exam, marks]) => {
          marks.forEach((m) => allMarks.push({ subject: m.subject, exam, marks: m.marks, maxMarks: m.max }));
        });
        const { subjectAvg, examProgress } = aggregateMarks(allMarks);
        const radarData = subjectAvg.map((s) => ({ subject: s.subject, score: s.avg }));
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => exportCSV("my-marks", allMarks.map((m) => [m.exam, m.subject, m.marks, m.maxMarks, ((m.marks / m.maxMarks) * 100).toFixed(0) + "%"]), ["Exam", "Subject", "Marks", "Max", "%"])}><Download className="mr-1.5 h-3.5 w-3.5" />Export CSV</Button>
              <Button variant="outline" size="sm" onClick={() => exportPDF("report-card", `Report Card — ${student.name}`, (doc) => {
                pdfTable(doc, ["Exam", "Subject", "Marks", "Max", "Grade"], allMarks.map((m) => [m.exam, m.subject, String(m.marks), String(m.maxMarks), ""]));
              })}><Download className="mr-1.5 h-3.5 w-3.5" />Report Card PDF</Button>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-sm">{lang === "te" ? "విషయ-వారీ పనితీరె" : "Subject Performance"}</CardTitle></CardHeader>
                <CardContent><SubjectPerformanceBar data={subjectAvg} /></CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">{lang === "te" ? "పనితీరె రాడార్" : "Performance Radar"}</CardTitle></CardHeader>
                <CardContent><SubjectRadar data={radarData} /></CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader><CardTitle className="text-sm">{lang === "te" ? "పరీక్ష-వారీ పురోగతి" : "Exam-wise Progress"}</CardTitle></CardHeader>
              <CardContent><ExamProgressChart data={examProgress} /></CardContent>
            </Card>
            {Object.entries(examMap).map(([exam, marks]) => {
              const avg = marks.length > 0 ? Math.round(marks.reduce((a, b) => a + (b.marks / b.max) * 100, 0) / marks.length) : 0;
              return (
                <Card key={exam}>
                  <CardHeader><CardTitle className="flex items-center justify-between text-base"><span>{exam}</span><Badge variant="secondary">{avg}%</Badge></CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {marks.map((m) => (
                      <div key={m.subject} className="flex items-center gap-3">
                        <span className="w-40 text-sm">{m.subject}</span>
                        <Progress value={(m.marks / m.max) * 100} className="flex-1" />
                        <span className="w-20 text-right text-sm font-medium">{m.marks}/{m.max}</span>
                        {m.grade && <Badge variant="outline" className="w-8 justify-center">{m.grade}</Badge>}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        );
      })()
    ),
    announcements: (
      <div className="space-y-2">
        {notices.map((n) => (
          <Card key={n.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{lang === "te" && n.titleTe ? n.titleTe : n.title}</p>
                <Badge variant="outline">{n.category}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{lang === "te" && n.contentTe ? n.contentTe : n.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    ),
    idcard: (
      <div className="space-y-3">
        {student.idCards.length === 0 && <p className="text-sm text-muted-foreground">{lang === "te" ? "ఇంకా ID కార్డు అభ్యర్థనలు లేవు." : "No ID card requests yet."}</p>}
        {student.idCards.map((c) => (
          <Card key={c.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-semibold">{c.cardType} ID Card</p>
                <p className="text-xs text-muted-foreground">{lang === "te" ? "అభ్యర్థించారు" : "Requested"}: {fmtDate(c.createdAt)}</p>
              </div>
              <Badge variant={c.status === "ISSUED" ? "default" : "secondary"}>{c.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    ),
    profile: (
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">{lang === "te" ? "విద్యార్థి వివరాలు" : "Student Details"}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              [lang === "te" ? "పేరు" : "Name", student.name],
              [lang === "te" ? "అడ్మిషన్ నెం." : "Admission No.", student.admissionNo],
              [lang === "te" ? "తండ్రి పేరు" : "Father", student.fatherName],
              [lang === "te" ? "తల్లి పేరు" : "Mother", student.motherName],
              [lang === "te" ? "లింగం" : "Gender", student.gender],
              [lang === "te" ? "పుట్టిన తేదీ" : "DOB", fmtDate(student.dob)],
              [lang === "te" ? "వర్గం" : "Category", student.category ?? "—"],
              [lang === "te" ? "మాధ్యమం" : "Medium", student.medium],
              [lang === "te" ? "తరగతి" : "Class", `${enrolment?.className}-${enrolment?.section}`],
              [lang === "te" ? "రోల్ నెం." : "Roll No.", student.rollNo ?? "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border py-1.5">
                <span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">{lang === "te" ? "సంరక్షకులు" : "Guardians"}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {student.guardians.map((g) => (
              <div key={g.id} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{g.guardian.name}</p>
                  {g.isPrimary && <Badge variant="secondary">{lang === "te" ? "ప్రాథమిక" : "Primary"}</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{g.guardian.relationship} · {g.guardian.phone}</p>
                {g.guardian.occupation && <p className="text-xs text-muted-foreground">{g.guardian.occupation}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    ),
  };

  return (
    <PortalScaffold
      nav={nav}
      sections={sections}
      title={lang === "te" ? "విద్యార్థి పోర్టల్" : "Student Portal"}
      subtitle={`${student.name} · ${enrolment?.className}-${enrolment?.section}`}
    />
  );
}

// ─── Student attendance section with charts ───────────────────────────
function StudentAttendanceSection({
  attendance, attRate, present, lang,
}: {
  attendance: any[]; attRate: number; present: number; lang: "en" | "te";
}) {
  const monthly = useMonthlyAttendance(attendance);
  const absent = attendance.filter((a) => a.status === "ABSENT").length;
  const late = attendance.filter((a) => a.status === "LATE").length;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={lang === "te" ? "హాజరు రేటు" : "Attendance Rate"} value={`${attRate}%`} icon={CalendarCheck} tone={attRate > 85 ? "success" : "warning"} />
        <StatCard label={lang === "te" ? "హాజరైన రోజులు" : "Days Present"} value={present} icon={CheckCircle2} />
        <StatCard label={lang === "te" ? "గైరుహాజరు" : "Absent"} value={absent} icon={AlertCircle} tone="danger" />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => exportCSV("my-attendance", attendance.map((a) => [fmtDate(a.date), a.status]), ["Date", "Status"])}><Download className="mr-1.5 h-3.5 w-3.5" />Export CSV</Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">{lang === "te" ? "నెలవారీ విభజన" : "Monthly Breakdown"}</CardTitle></CardHeader>
          <CardContent><AttendanceBreakdownChart data={monthly} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">{lang === "te" ? "మొత్తం పంపిణీ" : "Overall Distribution"}</CardTitle></CardHeader>
          <CardContent>
            <AttendancePie data={[
              { name: "Present", value: present },
              { name: "Late", value: late },
              { name: "Absent", value: absent },
            ]} />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">{lang === "te" ? "ఇటీవలి రికార్డులు" : "Recent Records"}</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>{lang === "te" ? "తేదీ" : "Date"}</TableHead><TableHead>{lang === "te" ? "స్థితి" : "Status"}</TableHead></TableRow></TableHeader>
            <TableBody>
              {attendance.slice(0, 14).map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="text-sm">{fmtDate(a.date, "en-IN", { day: "numeric", month: "short" })}</TableCell>
                  <TableCell><Badge variant={a.status === "PRESENT" ? "default" : a.status === "LATE" ? "secondary" : "destructive"}>{a.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
