"use client";

import { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";

export interface AttendancePoint {
  date: string;     // ISO
  status: string;   // PRESENT | ABSENT | LATE
  className?: string;
  section?: string;
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Aggregate attendance records into monthly present-rate percentages for a class.
export function useMonthlyAttendance(records: AttendancePoint[]): {
  month: string;
  present: number;
  absent: number;
  late: number;
  rate: number;
}[] {
  return useMemo(() => {
    const byMonth: Record<number, { present: number; absent: number; late: number }> = {};
    records.forEach((r) => {
      const d = new Date(r.date);
      const m = d.getMonth();
      if (!byMonth[m]) byMonth[m] = { present: 0, absent: 0, late: 0 };
      if (r.status === "PRESENT") byMonth[m].present++;
      else if (r.status === "ABSENT") byMonth[m].absent++;
      else if (r.status === "LATE") byMonth[m].late++;
    });
    return MONTH_LABELS.map((label, i) => {
      const m = byMonth[i] ?? { present: 0, absent: 0, late: 0 };
      const total = m.present + m.absent + m.late;
      const rate = total > 0 ? Math.round((m.present / total) * 100) : 0;
      return { month: label, ...m, rate };
    });
  }, [records]);
}

// Line chart of monthly attendance rate for multiple classes/sections.
export function AttendanceTrendChart({ data }: { data: { month: string; rate: number; label?: string }[] | { month: string; [k: string]: any }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="currentColor" className="opacity-60" />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="currentColor" className="opacity-60" />
        <Tooltip
          contentStyle={{ background: "oklch(0.235 0.006 260)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff" }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line type="monotone" dataKey="rate" name="Attendance Rate %" stroke="oklch(0.62 0.12 152)" strokeWidth={2.5} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Stacked bar chart: present / absent / late per month for a single entity.
export function AttendanceBreakdownChart({ data }: { data: { month: string; present: number; absent: number; late: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="currentColor" className="opacity-60" />
        <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="opacity-60" />
        <Tooltip
          contentStyle={{ background: "oklch(0.235 0.006 260)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff" }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="present" stackId="a" fill="oklch(0.62 0.14 152)" name="Present" radius={[0, 0, 0, 0]} />
        <Bar dataKey="late" stackId="a" fill="oklch(0.65 0.15 70)" name="Late" radius={[0, 0, 0, 0]} />
        <Bar dataKey="absent" stackId="a" fill="oklch(0.6 0.18 30)" name="Absent" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Pie chart of overall attendance distribution.
const PIE_COLORS = ["oklch(0.62 0.14 152)", "oklch(0.65 0.15 70)", "oklch(0.6 0.18 30)"];

export function AttendancePie({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={{ fontSize: 11, fill: "currentColor" }}>
          {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
        </Pie>
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{ background: "oklch(0.235 0.006 260)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Days-present count bar chart — shows how many days each student attended.
export function DaysPresentChart({ data }: { data: { name: string; present: number; absent: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
        <XAxis type="number" tick={{ fontSize: 11 }} stroke="currentColor" className="opacity-60" />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={70} stroke="currentColor" className="opacity-60" />
        <Tooltip
          contentStyle={{ background: "oklch(0.235 0.006 260)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff" }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="present" stackId="a" fill="oklch(0.62 0.14 152)" name="Present" />
        <Bar dataKey="absent" stackId="a" fill="oklch(0.6 0.18 30)" name="Absent" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
