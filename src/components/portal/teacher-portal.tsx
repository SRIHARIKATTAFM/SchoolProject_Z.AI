"use client";

import { useI18n } from "@/lib/i18n-provider";
import { PortalScaffold, StatCard, type NavItem } from "@/components/portal/portal-scaffold";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CalendarCheck, ClipboardList, CalendarDays, Megaphone, Users, GraduationCap, CheckCircle2 } from "lucide-react";
import type { TeacherData } from "@/lib/portal-data";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function TeacherPortal({ data }: { data: TeacherData }) {
  const { lang } = useI18n();
  const { staff, className, section, students, homework, timetable, attendance } = data;

  const present = attendance.filter((a) => a.status === "PRESENT").length;
  const attRate = attendance.length > 0 ? Math.round((present / attendance.length) * 100) : 0;

  const nav: NavItem[] = [
    { id: "classes", labelKey: "portal.myClasses", icon: Users, count: students.length },
    { id: "attendance", labelKey: "portal.attendance", icon: CalendarCheck },
    { id: "marks", labelKey: "portal.academics", icon: ClipboardList },
    { id: "homework", labelKey: "portal.homework", icon: BookOpen, count: homework.length },
    { id: "timetable", labelKey: "portal.timetable", icon: CalendarDays },
    { id: "announcements", labelKey: "portal.announcements", icon: Megaphone },
  ];

  const sections: Record<string, React.ReactNode> = {
    classes: (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label={lang === "te" ? "తరగతి" : "Class"} value={`${className}-${section}`} icon={GraduationCap} />
          <StatCard label={lang === "te" ? "విద్యార్థులు" : "Students"} value={students.length} icon={Users} />
          <StatCard label={lang === "te" ? "బోధించే విషయం" : "Subject"} value={staff?.subject ?? "—"} icon={BookOpen} />
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>{lang === "te" ? "రోల్ నెం." : "Roll"}</TableHead><TableHead>{lang === "te" ? "పేరు" : "Name"}</TableHead><TableHead>{lang === "te" ? "లింగం" : "Gender"}</TableHead><TableHead>{lang === "te" ? "మాధ్యమం" : "Medium"}</TableHead></TableRow></TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.rollNo}</TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.gender}</TableCell>
                    <TableCell>{s.medium}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    ),
    attendance: (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label={lang === "te" ? "హాజరు రేటు" : "Attendance Rate"} value={`${attRate}%`} icon={CalendarCheck} tone={attRate > 85 ? "success" : "warning"} />
          <StatCard label={lang === "te" ? "హాజరైన రోజులు" : "Present Records"} value={present} icon={CheckCircle2} />
          <StatCard label={lang === "te" ? "మొత్తం రికార్డులు" : "Total Records"} value={attendance.length} icon={ClipboardList} />
        </div>
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            {lang === "te" ? "రోజువారీ హాజరు నమోదు చేయడానికి విద్యార్థుల జాబితాను ఎంచుకోండి." : "Select a student list to mark daily attendance."}
          </CardContent>
        </Card>
      </div>
    ),
    marks: (
      <Card>
        <CardHeader><CardTitle className="text-base">{lang === "te" ? "పరీక్షలు & మార్కులు" : "Exams & Marks"}</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.exams.map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <p className="text-sm font-semibold">{e.name} · {e.className}-{e.section}</p>
                  <p className="text-xs text-muted-foreground">{e.academicYear} · {e.type.replace("_", " ")}</p>
                </div>
                <Badge variant="secondary">{lang === "te" ? "మార్కులు నమోదు" : "Marks Entry"}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    ),
    homework: (
      <div className="space-y-3">
        {homework.map((h) => (
          <Card key={h.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{h.title}</p>
                    <Badge variant="outline">{h.subject}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{h.description}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{lang === "te" ? "గడువు" : "Due"}: {new Date(h.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                </div>
                <Badge variant="secondary">{h._count.submissions} {lang === "te" ? "సమర్పణలు" : "submissions"}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    ),
    timetable: (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>{lang === "te" ? "పీరియడ్" : "Period"}</TableHead>{DAYS.map((d) => <TableHead key={d}>{d}</TableHead>)}</TableRow></TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5, 6, 7].map((p) => (
                <TableRow key={p}>
                  <TableCell className="font-medium">P{p}</TableCell>
                  {DAYS.map((d) => {
                    const tt = timetable.find((t) => t.day === d && t.period === p);
                    return <TableCell key={d} className="text-xs">{tt ? <span>{tt.subject}<br /><span className="text-muted-foreground">{tt.startTime}</span></span> : <span className="text-muted-foreground">—</span>}</TableCell>;
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    ),
    announcements: (
      <Card><CardContent className="p-4 text-sm text-muted-foreground">
        {lang === "te" ? "మీ తరగతికి ప్రకటనలు ప్రచురించండి. (డెమోలో చూడండి.)" : "Publish announcements to your class. (Demo view.)"}
      </CardContent></Card>
    ),
  };

  return (
    <PortalScaffold
      nav={nav}
      sections={sections}
      title={lang === "te" ? "ఉపాధ్యాయుల పోర్టల్" : "Teacher Portal"}
      subtitle={`${staff?.name ?? ""} · ${className}-${section}`}
    />
  );
}
