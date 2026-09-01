"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Search, Download, BookMarked } from "lucide-react";

interface SscPaper {
  id: string;
  year: number;
  subject: string;
  subjectTe: string | null;
  medium: string;
  docType: string;
  title: string;
}

const DOC_LABEL: Record<string, { en: string; te: string }> = {
  ACTUAL_PAPER: { en: "Actual Paper", te: "అసలు ప్రశ్నపత్రం" },
  MODEL_PAPER: { en: "Model Paper", te: "మోడల్ ప్రశ్నపత్రం" },
  BLUEPRINT: { en: "Blueprint", te: "బ్లూప్రింట్" },
  SUPPLEMENTARY: { en: "Supplementary", te: "సప్లిమెంటరీ" },
};

export function SscLibrary({ papers }: { papers: SscPaper[] }) {
  const { t, lang } = useI18n();
  const [q, setQ] = useState("");
  const [year, setYear] = useState<string>("all");
  const [subject, setSubject] = useState<string>("all");
  const [docType, setDocType] = useState<string>("all");

  const years = useMemo(
    () => Array.from(new Set(papers.map((p) => p.year))).sort((a, b) => b - a),
    [papers]
  );
  const subjects = useMemo(
    () => Array.from(new Set(papers.map((p) => p.subject))).sort(),
    [papers]
  );

  const filtered = useMemo(() => {
    return papers.filter((p) => {
      if (year !== "all" && String(p.year) !== year) return false;
      if (subject !== "all" && p.subject !== subject) return false;
      if (docType !== "all" && p.docType !== docType) return false;
      if (q && !p.title.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [papers, q, year, subject, docType]);

  return (
    <section id="ssc" className="scroll-mt-20 bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-3 gap-1">
            <BookMarked className="h-3.5 w-3.5" /> SSC Corner
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("sec.ssc.title")}</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {lang === "te"
              ? "దాదాపు 7 సంవత్సరాల ఎస్‌ఎస్‌సి ప్రశ్నపత్రాల కేంద్రీయ లైబ్రరీ — అందరికీ పంచుకోబడింది."
              : "A central archive of ~7 years of SSC question papers, model papers and blueprints — shared across schools."}
          </p>
        </div>

        <Card className="mt-8">
          <CardHeader className="pb-4">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("common.search")}
                  className="pl-8"
                />
              </div>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger><SelectValue placeholder={t("common.year")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.year")}: All</SelectItem>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger><SelectValue placeholder={t("common.subject")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.subject")}: All</SelectItem>
                  {subjects.map((s) => (
                    <SelectItem key={s} value={s}>{lang === "te" && s === "Telugu" ? "తెలుగు" : s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder={t("common.type")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.type")}: All</SelectItem>
                  {Object.entries(DOC_LABEL).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{lang === "te" ? v.te : v.en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="outline" className="self-center">
                {filtered.length} {lang === "te" ? "ఫలితాలు" : "results"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-[28rem] overflow-y-auto scroll-thin pr-1">
              <div className="grid gap-2.5 sm:grid-cols-2">
                {filtered.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/40"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                      <FileText className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <Badge variant="secondary" className="text-[10px]">{p.year}</Badge>
                        <Badge variant="outline" className="text-[10px]">{p.medium}</Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {DOC_LABEL[p.docType] ? (lang === "te" ? DOC_LABEL[p.docType].te : DOC_LABEL[p.docType].en) : p.docType}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0" aria-label={t("common.download")}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
                    {t("common.noResults")}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
