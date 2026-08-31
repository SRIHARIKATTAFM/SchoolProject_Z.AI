"use client";

import { useI18n } from "@/lib/i18n-provider";
import { PortalScaffold, type NavItem } from "@/components/portal/portal-scaffold";
import { IssuanceDesk, type StudentLite, type RequestLite } from "@/components/portal/issuance-desk";
import { IdCard, ShieldAlert } from "lucide-react";
import type { IdOperatorData } from "@/lib/portal-data";

export function IdCardPortal({ data }: { data: IdOperatorData }) {
  const { lang } = useI18n();

  const students = data.students as unknown as StudentLite[];
  const requests = data.requests as unknown as RequestLite[];
  const school = data.school!;

  const nav: NavItem[] = [
    { id: "desk", labelKey: "portal.idCards", icon: IdCard, count: data.students.length },
  ];

  const sections: Record<string, React.ReactNode> = {
    desk: (
      <div className="space-y-4">
        <div className="flex items-start gap-2 rounded-md border border-amber-300/50 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            {lang === "te"
              ? "స్కూల్ కౌంటర్ డెస్క్ — విద్యార్థిని కనుగొనండి, 2×2 ఫోటో తీయండి, ఐడెంటిటీ కార్డు జారీ చేయండి. టీచర్లు, పథక సిబ్బంది, తల్లిదండ్రులు ఈ డెస్క్‌ను చూడరు."
              : "School counter desk — find a pupil, take a 2×2 photo, issue the identity card. Teachers, scheme staff and parents do not see this desk."}
          </p>
        </div>
        <IssuanceDesk students={students} requests={requests} school={school} operatorId={data.operatorId} />
      </div>
    ),
  };

  return (
    <PortalScaffold
      nav={nav}
      sections={sections}
      title={lang === "te" ? "ID కార్డ్ జారీ డెస్క్" : "ID Card Issuance Desk"}
      subtitle={lang === "te" ? "ఫోటో → జారీ → ప్రింట్ (CR80)" : "Photo → Issue → Print (CR80)"}
    />
  );
}
