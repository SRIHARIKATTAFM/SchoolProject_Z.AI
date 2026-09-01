"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/lib/i18n-provider";
import { LangToggle } from "@/components/lang-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, LogIn, ArrowLeft, Loader2, User } from "lucide-react";

const DEMO = [
  { email: "hm@zphsknp.edu.in", role: "Headmaster / Admin", te: "ప్రధానోపాధ్యాయులు" },
  { email: "teacher@zphsknp.edu.in", role: "Teacher", te: "ఉపాధ్యాయుడు" },
  { email: "student@zphsknp.edu.in", role: "Student", te: "విద్యార్థి" },
  { email: "parent@zphsknp.edu.in", role: "Parent", te: "తల్లి/తండ్రి" },
  { email: "scheme@zphsknp.edu.in", role: "Scheme Operator", te: "పథక ఆపరేటర్" },
  { email: "idcard@zphsknp.edu.in", role: "ID Card Operator", te: "ఐడి కార్డ్ ఆపరేటర్" },
  { email: "meo@bapatla.gov.in", role: "Mandal (MEO)", te: "మండల్ (MEO)" },
  { email: "minister@ap.gov.in", role: "Minister / CM", te: "మంత్రి / CM" },
];

export default function LoginPage() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("demo123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError(t("login.invalid"));
      return;
    }
    const next = params.get("callbackUrl") || "/portal";
    router.push(next);
    router.refresh();
  }

  function quickLogin(em: string) {
    setEmail(em);
    setPassword("demo123");
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
          <GraduationCap className="h-5 w-5 text-primary" />
          ZPHS Kunaparajuparva
        </Link>
        <div className="flex items-center gap-2">
          <LangToggle />
          <Button asChild variant="ghost" size="sm">
            <Link href="/"><ArrowLeft className="mr-1.5 h-4 w-4" />{t("login.backHome")}</Link>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-4xl gap-6 lg:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><LogIn className="h-5 w-5 text-primary" />{t("login.title")}</CardTitle>
              <CardDescription>{t("login.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">{t("login.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@zphsknp.edu.in"
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">{t("login.password")}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("login.submit")}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" />{t("login.demoTitle")}</CardTitle>
              <CardDescription>
                {lang === "te" ? "ఒక ఖాతాపై క్లిక్ చేయండి — పాస్‌వర్డ్ స్వయంచాలకంగా నింపబడుతుంది." : "Click an account — the password is filled automatically."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid max-h-[24rem] gap-2 overflow-y-auto scroll-thin pr-1 sm:grid-cols-2">
                {DEMO.map((d) => (
                  <button
                    key={d.email}
                    type="button"
                    onClick={() => quickLogin(d.email)}
                    className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-2.5 text-left transition-colors hover:border-primary/50 hover:bg-accent"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {d.role[0]}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">{lang === "te" ? d.te : d.role}</p>
                      <p className="truncate text-[10px] text-muted-foreground">{d.email}</p>
                    </div>
                  </button>
                ))}
              </div>
              <Badge variant="secondary" className="mt-3 w-full justify-center py-1.5 text-xs">
                {lang === "te" ? "అందరికీ పాస్‌వర్డ్: demo123" : "Password for all: demo123"}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
