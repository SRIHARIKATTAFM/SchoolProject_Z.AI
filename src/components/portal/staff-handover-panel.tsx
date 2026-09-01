"use client";

import { useI18n } from "@/lib/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Crown, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { fmtDate } from "@/lib/date";

export interface HandoverInfo {
  status: string;
  authorizedUser: { id: string; name: string; email: string; role: string } | null;
  fromHM: { name: string } | null;
  note: string | null;
  createdAt: string | Date;
}

// Standalone handover panel for non-HM staff (Teacher, ID Operator, Scheme Operator).
// Shows the "Onboard New Headmaster" panel IF this user is the authorized person.
export function StaffHandoverPanel({
  handover,
  currentUserId,
}: {
  handover: HandoverInfo | null;
  currentUserId: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { lang } = useI18n();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("demo123");

  const isAuthorized = handover?.status === "ACTIVE" && handover?.authorizedUser?.id === currentUserId;

  async function onboardHM() {
    startTransition(async () => {
      const res = await fetch("/api/portal/handover/onboard-hm", {
        method: "POST",
        body: JSON.stringify({ name, email, phone, password }),
        headers: { "Content-Type": "application/json" },
      });
      const j = await res.json();
      toast({
        title: res.ok ? (lang === "te" ? "కొత్త HM ఆన్‌బోర్డ్" : "New HM onboarded") : "Error",
        description: res.ok ? `${name} — ${email}` : j.error,
        variant: res.ok ? "default" : "destructive",
      });
      if (res.ok) { setOpen(false); setName(""); setEmail(""); setPassword("demo123"); router.refresh(); }
    });
  }

  if (!handover) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          <Crown className="mx-auto mb-2 h-8 w-8 opacity-40" />
          {lang === "te" ? "ప్రస్తుతం హ్యాండోవర్ అధికారం లేదు." : "No active handover authorization."}
        </CardContent>
      </Card>
    );
  }

  if (!isAuthorized) {
    // Show status info if there's a handover but this user is NOT the authorized person.
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm"><Crown className="h-4 w-4 text-amber-500" />{lang === "te" ? "HM హ్యాండోవర్ స్థితి" : "HM Handover Status"}</CardTitle>
        </CardHeader>
        <CardContent>
          {handover.status === "ACTIVE" && (
            <div className="flex items-center gap-2 rounded-md bg-amber-500/10 p-3 text-sm">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span className="text-muted-foreground">
                {lang === "te" ? "అధికారం క్రియాశీలంగా ఉంది — " : "Authorization is ACTIVE — "}
                {handover.authorizedUser?.name} {lang === "te" ? "కొత్త HM ను ఆన్‌బోర్డ్ చేయగలరు." : "can onboard the new HM."}
              </span>
            </div>
          )}
          {handover.status === "CONSUMED" && (
            <div className="flex items-center gap-2 rounded-md bg-green-500/10 p-3 text-sm text-green-300">
              <CheckCircle2 className="h-4 w-4" />
              {lang === "te" ? "హ్యాండోవర్ పూర్తయింది — కొత్త HM ఆన్‌బోర్డ్ అయ్యారు." : "Handover complete — new HM has been onboarded."}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // This user IS authorized — show the onboard panel.
  return (
    <Card className="border-green-500/30 bg-green-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm"><Crown className="h-4 w-4 text-green-500" />{lang === "te" ? "కొత్త హెడ్‌మాస్టర్ ఆన్‌బోర్డ్" : "Onboard New Headmaster"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-3 rounded-md bg-green-500/10 p-3 text-sm text-green-200">
          <ShieldCheck className="mr-1.5 inline h-4 w-4" />
          {lang === "te"
            ? "మీరు కొత్త HM ను ఆన్‌బోర్డ్ చేయడానికి అధికారం పొందారు. విదాయక HM ద్వారా అధికారం ఇవ్వబడింది."
            : "You are authorized to onboard the new Headmaster. Authorized by the outgoing HM."}
          {handover.fromHM && <span className="block text-xs opacity-80 mt-1">Authorized by: {handover.fromHM.name} · {fmtDate(handover.createdAt, "en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>}
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          {lang === "te" ? "ఆన్‌బోర్డ్ అయిన తర్వాత ఈ ఎంపిక స్వయంచాలకంగా నిలిపివేయబడుతుంది." : "After onboarding, this option auto-disables."}
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <Button onClick={() => setOpen(true)}><Crown className="mr-1.5 h-4 w-4" />{lang === "te" ? "కొత్త HM ఆన్‌బోర్డ్" : "Onboard new HM"}</Button>
          <DialogContent>
            <DialogHeader><DialogTitle>{lang === "te" ? "కొత్త హెడ్‌మాస్టర్" : "New Headmaster"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Full name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div><Label>Email *</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" /></div>
              <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
              <div><Label>Password *</Label><Input value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={onboardHM} disabled={pending || !name || !email || !password}><Crown className="mr-1.5 h-4 w-4" />Onboard HM</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
