"use client";

import { useI18n } from "@/lib/i18n-provider";
import { PortalScaffold, StatCard, type NavItem } from "@/components/portal/portal-scaffold";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Baby, BookOpen, CalendarCheck, ClipboardList, CalendarDays, Megaphone, IdCard, CheckCircle2, Clock } from "lucide-react";
import type { StudentData } from "@/lib/portal-data";

export function ParentPortal({ data }: { data: NonNullable<StudentData> }) {
  const { lang } = useI18n();
  const { student, enrolment, homework, notices } = data;

  const attendance = student.attendance;
  const present = attendance.filter((a) => a.status === "PRESENT").length;
  const attRate = attendance.length > 0 ? Math.round((present / attendance.length) * 100) : 0;

  const pendingHw = homework.filter((h) => {
    const sub = student.homeworkSubs.find((s) => s.homeworkId === h.id);
    return !sub || sub.status === "PENDING";
  }).length;

  const examMap: Record<string, { subject: string; marks: number; max: number; grade?: string }[]> = {};
  student.marks.forEach((m) => {
    const k = `${m.exam.name}`;
    if (!examMap[k]) examMap[k] = [];
    examMap[k].push({ subject: m.subject, marks: m.marks, max: m.maxMarks, grade: m.grade ?? undefined });
  });

  const nav: NavItem[] = [
    { id: "child", labelKey: "portal.child", icon: Baby },
    { id: "homework", labelKey: "portal.homework", icon: BookOpen, count: pendingHw },
    { id: "attendance", labelKey: "portal.attendance", icon: CalendarCheck },
    { id: "results", labelKey: "portal.results", icon: ClipboardList },
    { id: "timetable", labelKey: "portal.timetable", icon: CalendarDays },
    { id: "announcements", labelKey: "portal.announcements", icon: Megaphone, count: notices.length },
    { id: "idcard", labelKey: "portal.idCards", icon: IdCard },
  ];

  const sections: Record<string, React.ReactNode> = {
    child: (
      <div className="space-y-6">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-5">
            <p className="text-sm opacity-90">{lang === "te" ? "మీ బిడ్డ" : "Your Child"}</p>
            <h2 className="mt-1 text-2xl font-bold">{student.name}</h2>
            <p className="mt-1 text-sm opacity-90">{enrolment?.className}-{enrolment?.section} · {lang === "te" ? "రోల్" : "Roll"} {student.rollNo}</p>
          </CardContent>
        </Card>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label={lang === "te" ? "హాజరు రేటు" : "Attendance"} value={`${attRate}%`} icon={CalendarCheck} tone={attRate > 85 ? "success" : "warning"} />
          <StatCard label={lang === "te" ? "పెండింగ్ హోంవర్క్" : "Pending Homework"} value={pendingHw} icon={BookOpen} />
          <StatCard label={lang === "te" ? "మొత్తం పరీక్షలు" : "Exams"} value={Object.keys(examMap).length} icon={ClipboardList} />
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base">{lang === "te" ? "సంరక్షకులు" : "Guardians"}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {student.guardians.map((g) => (
              <div key={g.id} className="flex items-center justify-between rounded-md border border-border p-2.5">
                <div><p className="text-sm font-medium">{g.guardian.name}</p><p className="text-xs text-muted-foreground">{g.guardian.relationship} · {g.guardian.phone}</p></div>
                {g.isPrimary && <Badge variant="secondary">{lang === "te" ? "ప్రాథమిక" : "Primary"}</Badge>}
              </div>
            ))}
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
                    <div className="flex items-center gap-2"><p className="text-sm font-semibold">{h.title}</p><Badge variant="outline">{h.subject}</Badge></div>
                    <p className="mt-1 text-xs text-muted-foreground">{h.description}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{lang === "te" ? "గడువు" : "Due"}: {new Date(h.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  </div>
                  <Badge variant={status === "SUBMITTED" || status === "GRADED" ? "default" : "secondary"}>
                    {status === "SUBMITTED" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                    {status === "PENDING" && <Clock className="mr-1 h-3 w-3" />}
                    {status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    ),
    attendance: (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label={lang === "te" ? "హాజరు రేటు" : "Attendance Rate"} value={`${attRate}%`} icon={CalendarCheck} tone={attRate > 85 ? "success" : "warning"} />
          <StatCard label={lang === "te" ? "హాజరైన రోజులు" : "Days Present"} value={present} icon={CheckCircle2} />
          <StatCard label={lang === "te" ? "గైరుహాజరు" : "Absent"} value={attendance.filter((a) => a.status === "ABSENT").length} icon={CalendarCheck} tone="danger" />
        </div>
      </div>
    ),
    results: (
      <div className="space-y-4">
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
    ),
    timetable: (
      <Card><CardContent className="p-4 text-sm text-muted-foreground">
        {lang === "te" ? "మీ బిడ్డ తరగతి షెడ్యూల్ విద్యార్థి పోర్టల్‌లో అందుబాటులో ఉంది." : "Your child's class schedule is available in the Student Portal."}
      </CardContent></Card>
    ),
    announcements: (
      <div className="space-y-2">
        {notices.map((n) => (
          <Card key={n.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between"><p className="text-sm font-semibold">{lang === "te" && n.titleTe ? n.titleTe : n.title}</p><Badge variant="outline">{n.category}</Badge></div>
              <p className="mt-1 text-xs text-muted-foreground">{lang === "te" && n.contentTe ? n.contentTe : n.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    ),
    idcard: (
      <div className="space-y-3">
        {student.idCards.length === 0 && <p className="text-sm text-muted-foreground">{lang === "te" ? "ID కార్డు అభ్యర్థనలు లేవు." : "No ID card requests."}</p>}
        {student.idCards.map((c) => (
          <Card key={c.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div><p className="text-sm font-semibold">{c.cardType} ID Card</p><p className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString("en-IN")}</p></div>
              <Badge variant={c.status === "ISSUED" ? "default" : "secondary"}>{c.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    ),
  };

  return (
    <PortalScaffold
      nav={nav}
      sections={sections}
      title={lang === "te" ? "తల్లి/తండ్రి పోర్టల్" : "Parent Portal"}
      subtitle={`${student.name} · ${enrolment?.className}-${enrolment?.section}`}
    />
  );
}
