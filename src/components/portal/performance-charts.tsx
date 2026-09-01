"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line,
} from "recharts";

export interface SubjectMark {
  subject: string;
  exam: string;
  marks: number;
  maxMarks: number;
}

// Bar chart: average score per subject (aggregated across exams).
export function SubjectPerformanceBar({ data }: { data: { subject: string; avg: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
        <XAxis dataKey="subject" tick={{ fontSize: 10 }} stroke="currentColor" className="opacity-60" />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="currentColor" className="opacity-60" />
        <Tooltip
          contentStyle={{ background: "oklch(0.235 0.006 260)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff" }}
          formatter={(v: any) => [`${v}%`, "Avg Score"]}
        />
        <Bar dataKey="avg" fill="oklch(0.62 0.12 152)" radius={[4, 4, 0, 0]} name="Avg Score %" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Radar chart: subject-wise performance (normalized to 100).
export function SubjectRadar({ data }: { data: { subject: string; score: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="currentColor" className="opacity-20" />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} stroke="currentColor" className="opacity-60" />
        <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} stroke="currentColor" className="opacity-40" />
        <Radar name="Score %" dataKey="score" stroke="oklch(0.62 0.12 152)" fill="oklch(0.62 0.12 152)" fillOpacity={0.3} />
        <Tooltip
          contentStyle={{ background: "oklch(0.235 0.006 260)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff" }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// Line chart: exam-wise progress (how the student's average changed across FA1→SA2).
export function ExamProgressChart({ data }: { data: { exam: string; avg: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
        <XAxis dataKey="exam" tick={{ fontSize: 11 }} stroke="currentColor" className="opacity-60" />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="currentColor" className="opacity-60" />
        <Tooltip
          contentStyle={{ background: "oklch(0.235 0.006 260)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff" }}
          formatter={(v: any) => [`${v}%`, "Avg Score"]}
        />
        <Line type="monotone" dataKey="avg" name="Avg Score %" stroke="oklch(0.62 0.12 152)" strokeWidth={2.5} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Comparative bar: this student vs class average per subject.
export function ComparativeBar({ data }: { data: { subject: string; student: number; classAvg: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
        <XAxis dataKey="subject" tick={{ fontSize: 10 }} stroke="currentColor" className="opacity-60" />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="currentColor" className="opacity-60" />
        <Tooltip
          contentStyle={{ background: "oklch(0.235 0.006 260)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff" }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="student" fill="oklch(0.62 0.12 152)" name="You" radius={[3, 3, 0, 0]} />
        <Bar dataKey="classAvg" fill="oklch(0.65 0.15 70)" name="Class Avg" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Aggregate marks into subject averages and exam progress.
export function aggregateMarks(marks: SubjectMark[]) {
  const bySubject: Record<string, { total: number; count: number }> = {};
  const byExam: Record<string, { total: number; count: number }> = {};
  marks.forEach((m) => {
    const pct = (m.marks / m.maxMarks) * 100;
    if (!bySubject[m.subject]) bySubject[m.subject] = { total: 0, count: 0 };
    bySubject[m.subject].total += pct;
    bySubject[m.subject].count++;
    if (!byExam[m.exam]) byExam[m.exam] = { total: 0, count: 0 };
    byExam[m.exam].total += pct;
    byExam[m.exam].count++;
  });
  const subjectAvg = Object.entries(bySubject).map(([subject, v]) => ({
    subject, avg: Math.round(v.total / v.count),
  }));
  const examProgress = Object.entries(byExam).map(([exam, v]) => ({
    exam, avg: Math.round(v.total / v.count),
  }));
  return { subjectAvg, examProgress };
}
