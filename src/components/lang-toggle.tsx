"use client";

import { useI18n } from "@/lib/i18n-provider";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LangToggle() {
  const { lang, toggle } = useI18n();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      className="gap-1.5 font-medium"
      aria-label="Toggle language"
    >
      <Languages className="h-4 w-4" />
      {lang === "en" ? "తెలుగు" : "English"}
    </Button>
  );
}
