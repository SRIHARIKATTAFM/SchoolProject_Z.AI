"use client";

import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/i18n-provider";
import { fmtDate, fmtMonthShort, utcDay } from "@/lib/date";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { SscLibrary } from "@/components/public/ssc-library";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LogIn, BookOpen, Users, Building2, CalendarDays, Trophy, Phone, MapPin, Mail,
  ShieldCheck, Library, FlaskConical, Cpu, Trees, HeartPulse, Bus, FileText,
  GraduationCap, Award, Megaphone, ChevronRight,
} from "lucide-react";
import type { PublicData } from "@/lib/public-data";

const FACILITIES = [
  { icon: Library, en: "Library", te: "గ్రంథాలయం", desc_en: "5,000+ books, reference material and periodicals.", desc_te: "5,000+ పుస్తకాలు, రిఫరెన్స్ సామగ్రి." },
  { icon: FlaskConical, en: "Science Lab", te: "సైన్స్ ల్యాబ్", desc_en: "Physics, Chemistry & Biology laboratories.", desc_te: "భౌతిక, రసాయన & జీవ ప్రయోగశాలలు." },
  { icon: Cpu, en: "Computer Lab", te: "కంప్యూటర్ ల్యాబ్", desc_en: "20 computers with internet for digital learning.", desc_te: "డిజిటల్ విద్య కోసం 20 కంప్యూటర్లు." },
  { icon: Trees, en: "Playground", te: "ఆట మైదానం", desc_en: "Large ground for sports, kabaddi, kho-kho & athletics.", desc_te: "క్రీడలు, కబడ్డీ, ఖో-ఖో ఆటలకు విశాల మైదానం." },
  { icon: HeartPulse, en: "Drinking Water & Sanitation", te: "త్రాగునీరు & పారిశుద్యం", desc_en: "RO water plant and separate toilets for boys & girls.", desc_te: "RO నీటి ప్లాంట్, బాలురు & బాలికలకు వేర్వేరు మరుగుదొడ్లు." },
  { icon: Bus, en: "Transport Support", te: "రవాణా సదుపాయం", desc_en: "Bicycle stands and bus pass assistance for students.", desc_te: "సైకిల్ స్టాండ్‌లు, బస్ పాస్ సహాయం." },
];

const CLASSES = [
  { c: "VI", en: "Foundation year — core subjects, activity-based learning.", te: "పునాది సంవత్సరం — మౌలిక విషయాలు, కార్యకలాపాధారిత బోధన." },
  { c: "VII", en: "Concept strengthening in languages, maths & science.", te: "భాషలు, గణితం & విజ్ఞానశాస్త్రంలో భావన బలోపేతం." },
  { c: "VIII", en: "Introduction to detailed sciences and social studies.", te: "విస్తృత విజ్ఞాన & సాంఘిక శాస్త్రాల పరిచయం." },
  { c: "IX", en: "Pre-SSC foundation — rigorous academics begin.", te: "ఎస్‌ఎస్‌సి పూర్వ పునాది — కఠినమైన విద్య ప్రారంభం." },
  { c: "X", en: "SSC public examination year — focused preparation.", te: "ఎస్‌ఎస్‌సి పబ్లిక్ పరీక్షా సంవత్సరం — కేంద్రీకృత సన్నాహం." },
];

const TRANSPARENCY = [
  { en: "School Development Plan published annually", te: "పాఠశాల అభివృద్ధి ప్రణాళిక ప్రతి సంవత్సరం ప్రచురితం" },
  { en: "SDMC (School Management Committee) meetings minutes public", te: "SDMC సమావేశాల నిమిషాలు ప్రజలకు అందుబాటులో" },
  { en: "Mid-day meal & Vidya Kanuka distribution audited", te: "మధ్యాహ్న భోజన & విద్యా కనుక పంపిణీ ఆడిట్ చేయబడింది" },
  { en: "Right to Education (RTE) compliance maintained", te: "RTE అనుగుణ్యత పాటించబడింది" },
];

function pickLang(en: string | null | undefined, te: string | null | undefined, lang: "en" | "te") {
  if (lang === "te" && te) return te;
  return en ?? te ?? "";
}

export function PublicSite({ data }: { data: PublicData }) {
  const { t, lang } = useI18n();
  const school = data.school;
  if (!school) return <div className="p-10 text-center">School not configured.</div>;

  const schoolName = pickLang(school.name, school.nameTe, lang);
  const stats = [
    { icon: Users, value: String(data.studentCount), label_en: "Students", label_te: "విద్యార్థులు" },
    { icon: GraduationCap, value: String(data.staff.length), label_en: "Staff", label_te: "ఉపాధ్యాయులు" },
    { icon: BookOpen, value: "VI–X", label_en: "Classes", label_te: "తరగతులు" },
    { icon: CalendarDays, value: String(school.established), label_en: "Established", label_te: "స్థాపితం" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader schoolName={schoolName} />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="hero-pattern absolute inset-0" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2">
            <div>
              <Badge className="mb-4 gap-1.5" variant="secondary">
                <ShieldCheck className="h-3.5 w-3.5" /> {t("hero.badge")}
              </Badge>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                {schoolName}
              </h1>
              <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
                {t("hero.subtitle")}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/login"><LogIn className="mr-1.5 h-4 w-4" />{t("hero.cta.portal")}</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#ssc"><BookOpen className="mr-1.5 h-4 w-4" />{t("hero.cta.ssc")}</a>
                </Button>
              </div>
              <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label_en} className="rounded-lg border border-border bg-card p-3">
                    <s.icon className="mb-1.5 h-4 w-4 text-primary" />
                    <dt className="text-xs text-muted-foreground">{lang === "te" ? s.label_te : s.label_en}</dt>
                    <dd className="text-lg font-bold">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="relative">
              <div className="overflow-hidden rounded-2xl border border-border shadow-lg">
                <Image
                  src="/campus/school-hero.jpg"
                  alt={lang === "te" ? "పాఠశాల భవనం" : "School building"}
                  width={1344}
                  height={768}
                  priority
                  className="aspect-[7/4] w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 hidden rounded-xl border border-border bg-background p-3 shadow-md sm:block">
                <p className="text-xs text-muted-foreground">UDISE</p>
                <p className="font-mono text-sm font-semibold">{school.udise}</p>
              </div>
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="scroll-mt-20 py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("sec.about.title")}</h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                <p>
                  {lang === "te"
                    ? "జిల్లా పరిషత్ ఉన్నత పాఠశాల, కుణపరాజుపర్వ, 1965లో స్థాపించబడింది. చుట్టుపక్కల గ్రామాల నుండి వచ్చే పిల్లలకు నాణ్యమైన విద్యను అందిస్తోంది."
                    : "Zilla Parishad High School, Kunaparajuparva was established in 1965 and has served the children of the surrounding villages with quality education for nearly six decades."}
                </p>
                <p>
                  {lang === "te"
                    ? "తెలుగు మాధ్యమంలో బోధన. 6వ తరగతి నుండి 10వ తరగతి వరకు. ప్రభుత్వ పథకాలైన అమ్మ ఒడి, జగన్నన్న విద్యా కనుక, ప్రీ-మెట్రిక్ స్కాలర్‌షిప్ లను అమలు చేస్తోంది."
                    : "Instruction is in Telugu medium across Classes VI to X. The school implements government schemes including Amma Vodi, Jagananna Vidya Kanuka, and Pre-Matric Scholarships."}
                </p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { k_en: "Medium", k_te: "మాధ్యమం", v: "Telugu" },
                  { k_en: "Mandal", k_te: "మండలం", v: school.mandal },
                  { k_en: "District", k_te: "జిల్లా", v: school.district },
                  { k_en: "Headmaster", k_te: "ప్రధానోపాధ్యాయులు", v: school.headmaster ?? "—" },
                ].map((x) => (
                  <div key={x.k_en} className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">{lang === "te" ? x.k_te : x.k_en}</p>
                    <p className="text-sm font-semibold">{x.v}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
              <Image
                src="/campus/classroom.jpg"
                alt={lang === "te" ? "తరగతి గది" : "Classroom"}
                width={1344}
                height={768}
                className="aspect-[16/10] w-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Academics */}
        <section id="academics" className="scroll-mt-20 bg-muted/30 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("sec.academics.title")}</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                {lang === "te" ? "ఆంధ్రప్రదేశ్ రాష్ట్ర పాఠ్యప్రణాళిక ప్రకారం." : "Following the Andhra Pradesh State Syllabus."}
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {CLASSES.map((c) => (
                <Card key={c.c} className="transition-shadow hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
                        {c.c}
                      </span>
                      <CardTitle className="text-base">{lang === "te" ? `${c.c} తరగతి` : `Class ${c.c}`}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs leading-relaxed text-muted-foreground">{lang === "te" ? c.te : c.en}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {["Telugu", "Hindi", "English", "Mathematics", "Physical Science", "Biological Science", "Social Studies"].map((s) => (
                <Badge key={s} variant="outline">{s}</Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Staff */}
        <section id="staff" className="scroll-mt-20 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("sec.staff.title")}</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {data.staff.map((s) => (
                <Card key={s.id} className="transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {s.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{pickLang(s.name, s.nameTe, lang)}</p>
                        <p className="truncate text-xs text-muted-foreground">{s.designation}</p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1.5"><BookOpen className="h-3 w-3" />{s.subject ?? "—"}</p>
                      <p className="flex items-center gap-1.5"><Award className="h-3 w-3" />{s.qualification ?? "—"}</p>
                    </div>
                    {s.status === "ON_LEAVE" && (
                      <Badge variant="secondary" className="mt-2 text-[10px]">{lang === "te" ? "సెలవులో" : "On Leave"}</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Facilities */}
        <section id="facilities" className="scroll-mt-20 bg-muted/30 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("sec.facilities.title")}</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FACILITIES.map((f) => (
                <Card key={f.en} className="transition-shadow hover:shadow-md">
                  <CardContent className="flex gap-3 p-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <f.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{lang === "te" ? f.te : f.en}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{lang === "te" ? f.desc_te : f.desc_en}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Notices + Events */}
        <section id="notices" className="scroll-mt-20 py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                  <Megaphone className="h-5 w-5 text-primary" />{t("sec.notices.title")}
                </h2>
              </div>
              <Card className="mt-5">
                <CardContent className="p-0">
                  <ul className="divide-y divide-border">
                    {data.notices.map((n) => (
                      <li key={n.id} className="flex items-start gap-3 p-4">
                        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-accent text-accent-foreground">
                          <FileText className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">{pickLang(n.title, n.titleTe, lang)}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{pickLang(n.content, n.contentTe, lang)}</p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px]">{n.category}</Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {n.publishedAt ? fmtDate(n.publishedAt, lang === "te" ? "te-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            <div id="events">
              <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                <CalendarDays className="h-5 w-5 text-primary" />{t("sec.events.title")}
              </h2>
              <div className="mt-5 space-y-3">
                {data.events.map((e) => (
                  <Card key={e.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-border bg-muted/40 text-center">
                          <span className="text-[10px] uppercase text-muted-foreground">
                            {fmtMonthShort(e.date)}
                          </span>
                          <span className="text-base font-bold leading-none">
                            {utcDay(e.date)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">{pickLang(e.title, e.titleTe, lang)}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{pickLang(e.description, null, lang)}</p>
                          {e.location && (
                            <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                              <MapPin className="h-3 w-3" />{e.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section id="achievements" className="scroll-mt-20 bg-muted/30 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <Trophy className="h-5 w-5 text-primary" />{t("sec.achievements.title")}
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {data.achievements.map((a) => (
                <Card key={a.id} className="transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <Badge variant="secondary" className="mb-2 text-[10px]">{a.level}</Badge>
                    <p className="text-sm font-semibold">{pickLang(a.title, a.titleTe, lang)}</p>
                    <p className="mt-1.5 text-xs text-muted-foreground">{pickLang(a.description, null, lang)}</p>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {fmtDate(a.date, "en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* SSC library */}
        <SscLibrary papers={data.sscPapers} />

        {/* Transparency */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                  <ShieldCheck className="h-5 w-5 text-primary" />{t("sec.transparency.title")}
                </h2>
                <ul className="mt-5 space-y-2.5">
                  {TRANSPARENCY.map((x) => (
                    <li key={x.en} className="flex items-start gap-2.5 text-sm">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{lang === "te" ? x.te : x.en}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-6">
                  <Building2 className="h-8 w-8 opacity-80" />
                  <h3 className="mt-3 text-lg font-semibold">
                    {lang === "te" ? "మల్టీ-టెనెంట్ ప్లాట్‌ఫారమ్" : "A Multi-Tenant Platform"}
                  </h3>
                  <p className="mt-2 text-sm opacity-90">
                    {lang === "te"
                      ? "ఈ వేదిక కేవలం ఒక పాఠశాలకే కాదు — అదే ఇంజిన్ వేలాది పాఠశాలలకు సేవలందించగలదు. పాఠశాల → మండల్ → జిల్లా → రాష్ట్ర స్థాయిలో సమాచారం సమీకరించబడుతుంది."
                      : "This is not just one school — the same engine can serve thousands of schools. Data aggregates upward: School → Mandal → District → State."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="scroll-mt-20 bg-muted/30 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("sec.contact.title")}</h2>
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">{lang === "te" ? "చిరునామా" : "Address"}</p>
                    <p className="text-sm text-muted-foreground">{school.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">{lang === "te" ? "ఫోన్" : "Phone"}</p>
                    <p className="text-sm text-muted-foreground">{school.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">Email</p>
                    <p className="text-sm text-muted-foreground">{school.email}</p>
                  </div>
                </div>
              </div>
              <Card>
                <CardContent className="flex aspect-[16/10] items-center justify-center bg-muted/40">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="mx-auto h-8 w-8" />
                    <p className="mt-2 text-sm">{school.mandal}, {school.district}</p>
                    <p className="text-xs">{school.state}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter
        schoolName={schoolName}
        address={school.address}
        phone={school.phone}
        email={school.email}
      />
    </div>
  );
}
