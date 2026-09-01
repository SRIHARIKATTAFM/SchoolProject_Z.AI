"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n-provider";
import { GraduationCap, MapPin, Phone, Mail, ShieldCheck } from "lucide-react";

export function SiteFooter({
  schoolName,
  address,
  phone,
  email,
}: {
  schoolName: string;
  address: string;
  phone: string;
  email: string;
}) {
  const { t, lang } = useI18n();
  return (
    <footer className="mt-auto border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="h-5 w-5" />
              </span>
              <span className="font-bold">{schoolName}</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {lang === "te"
                ? "బాపట్ల మండలం, బాపట్ల జిల్లా, ఆంధ్రప్రదేశ్ లోని ప్రభుత్వ ఉన్నత పాఠశాల. 6 నుండి 10 తరగతులు."
                : "A Government High School in Bapatla Mandal, Bapatla District, Andhra Pradesh. Serving Classes VI–X in Telugu medium."}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold">{t("sec.contact.title")}</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{address}</li>
              <li className="flex gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{phone}</li>
              <li className="flex gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{email}</li>
            </ul>
          </div>

          <div>
            <h4 className="flex items-center gap-1.5 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-primary" />
              {t("sec.transparency.title")}
            </h4>
            <p className="mt-3 rounded-md border border-amber-300/50 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200">
              {t("footer.disclaimer")}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-border pt-5 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {schoolName}. {t("footer.rights")}
          </p>
          <p className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-600" />
            {lang === "te" ? "AP స్కూల్ డిజిటల్ ప్లాట్‌ఫారమ్ — మొదటి రెఫరెన్స్ అమలు" : "AP School Digital Platform — first reference implementation"}
          </p>
        </div>
      </div>
    </footer>
  );
}
