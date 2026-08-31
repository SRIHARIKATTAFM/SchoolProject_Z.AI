"use client";

import { useI18n } from "@/lib/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/portal/portal-scaffold";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Users, GraduationCap, CalendarCheck, ClipboardList, Landmark, IdCard,
  Building2, ShieldCheck, TrendingUp, AlertTriangle,
} from "lucide-react";
import type { CommandData } from "@/lib/portal-data";

const ROLE_TITLE: Record<string, { en: string; te: string; sub_en: string; sub_te: string }> = {
  MEO: { en: "Mandal Command Center (MEO)", te: "మండల్ కమాండ్ సెంటర్ (MEO)", sub_en: "Bapatla Mandal — all schools", sub_te: "బాపట్ల మండలం — అన్ని పాఠశాలలు" },
  DEO: { en: "District Command Center (DEO)", te: "జిల్లా కమాండ్ సెంటర్ (DEO)", sub_en: "Bapatla District — all mandals", sub_te: "బాపట్ల జిల్లా — అన్ని మండలాలు" },
  STATE: { en: "State Administration Portal", te: "రాష్ట్ర నిర్వాహక పోర్టల్", sub_en: "Andhra Pradesh — statewide KPIs", sub_te: "ఆంధ్రప్రదేశ్ — రాష్ట్రవ్యాప్త KPIలు" },
  MINISTER: { en: "Education Minister / CM Dashboard", te: "విద్యా మంత్రి / CM డాష్‌బోర్డ్", sub_en: "Executive KPIs & district comparisons", sub_te: "కార్యనిర్వాహక KPIలు & జిల్లా పోలికలు" },
};

const PIE_COLORS = ["#2f7d52", "#d97706", "#7c3aed", "#dc2626", "#0891b2", "#65a30d"];

export function CommandPortal({ data }: { data: NonNullable<CommandData> }) {
  const { lang } = useI18n();
  const rt = ROLE_TITLE[data.role] ?? ROLE_TITLE.MEO;

  const classData = Object.entries(data.classMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const genderData = [
    { name: lang === "te" ? "బాలురు" : "Boys", value: data.genderDist.male },
    { name: lang === "te" ? "బాలికలు" : "Girls", value: data.genderDist.female },
  ];
  const catData = Object.entries(data.catMap).map(([name, value]) => ({ name, value }));
  const schemeData = Object.entries(data.schemeSummary).map(([name, v]) => ({ name, approved: v.approved, pending: v.total - v.approved }));

  return (
    <div className="mx-auto max-w-[1400px] p-4 sm:p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{lang === "te" ? rt.te : rt.en}</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{lang === "te" ? rt.sub_te : rt.sub_en}</p>
      </div>

      {/* Aggregation banner — no PII */}
      <div className="mb-6 flex items-start gap-2 rounded-md border border-green-300/50 bg-green-50 p-3 text-xs text-green-900 dark:border-green-500/30 dark:bg-green-950/30 dark:text-green-200">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        <p>{lang === "te"
          ? "ఈ డాష్‌బోర్డ్ సమీకృత KPIలను మాత్రమే చూపిస్తుంది. వ్యక్తిగత విద్యార్థి PII, ఆధార్, బ్యాంక్ సమాచారం ఎన్నడూ బహిర్గతం కాదు."
          : "This dashboard shows aggregated KPIs only. Individual student PII, Aadhaar and bank information are never exposed."}</p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={lang === "te" ? "మొత్తం నమోదు" : "Total Enrolment"} value={data.stats.totalStudents} icon={Users} hint={`${data.schools.length} ${lang === "te" ? "పాఠశాలలు" : "schools"}`} />
        <StatCard label={lang === "te" ? "హాజరు రేటు" : "Attendance Rate"} value={`${data.stats.attendanceRate}%`} icon={CalendarCheck} tone={data.stats.attendanceRate > 85 ? "success" : "warning"} />
        <StatCard label={lang === "te" ? "సగటు స్కోర్" : "Avg Score"} value={`${data.stats.avgScore}%`} icon={ClipboardList} tone={data.stats.avgScore > 60 ? "success" : "warning"} />
        <StatCard label={lang === "te" ? "సిబ్బంది (క్రియాశీల)" : "Staff (Active)"} value={`${data.stats.activeStaff}/${data.stats.totalStaff}`} icon={GraduationCap} />
        <StatCard label={lang === "te" ? "పథకాలు ఆమోదితం" : "Schemes Approved"} value={data.stats.schemesApproved} icon={Landmark} tone="success" />
        <StatCard label={lang === "te" ? "ID కార్డులు జారీ" : "ID Cards Issued"} value={data.stats.idCardsIssued} icon={IdCard} tone="success" />
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-4 w-4 text-primary" />{lang === "te" ? "తరగతి-వారీ నమోదు" : "Class-wise Enrolment"}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={classData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="oklch(0.45 0.11 152)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{lang === "te" ? "లింగ నిష్పత్తి" : "Gender Ratio"}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {genderData.map((_, i) => <Cell key={i} fill={i === 0 ? "oklch(0.45 0.11 152)" : "oklch(0.6 0.14 70)"} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{lang === "te" ? "వర్గ పంపిణీ" : "Category Distribution"}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {catData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{lang === "te" ? "పథకాల అమలు" : "Scheme Performance"}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={schemeData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="approved" name={lang === "te" ? "ఆమోదితం" : "Approved"} stackId="a" fill="oklch(0.45 0.11 152)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="pending" name={lang === "te" ? "పెండింగ్" : "Pending"} stackId="a" fill="oklch(0.6 0.14 70)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* District/state comparison placeholder for minister */}
      {data.role === "MINISTER" && (
        <Card className="mt-6">
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="h-4 w-4 text-amber-500" />{lang === "te" ? "జిల్లా పోలికలు" : "District Comparison"}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { d: "Bapatla", att: data.stats.attendanceRate, score: data.stats.avgScore },
              { d: "Guntur", att: 91, score: 68 },
              { d: "Prakasam", att: 88, score: 64 },
              { d: "Krishna", att: 93, score: 71 },
            ].map((x) => (
              <div key={x.d} className="grid grid-cols-[100px_1fr_60px] items-center gap-3">
                <span className="text-sm font-medium">{x.d}</span>
                <Progress value={x.att} />
                <span className="text-right text-xs font-semibold">{x.att}%</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
