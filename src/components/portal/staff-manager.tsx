"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { fmtDate } from "@/lib/date";
import { UserPlus, UserMinus, ShieldCheck, Crown, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

export interface StaffLite {
  id: string;
  name: string;
  designation: string;
  subject: string | null;
  phone: string | null;
  email: string | null;
  qualification: string | null;
  status: string;
  user: { id: string; email: string; role: string; active: boolean } | null;
}

interface StaffManagerProps {
  staff: StaffLite[];
  schoolId: string;
  operatorId: string;
  handover?: {
    status: string;
    authorizedUser: { id: string; name: string; email: string; role: string } | null;
    fromHM: { name: string } | null;
  } | null;
  onboardings: { id: string; name: string; email: string; role: string; status: string; invitedAt: string | Date }[];
}

const ROLES = [
  { value: "TEACHER", label: "Teacher (School Assistant / SGT)" },
  { value: "SCHEME_OPERATOR", label: "Scheme Operator" },
  { value: "ID_OPERATOR", label: "ID Card Operator" },
];

export function StaffManager({ staff, schoolId, operatorId, handover, onboardings }: StaffManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { lang } = useI18n();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  // Onboarding form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [designation, setDesignation] = useState("School Assistant");
  const [subject, setSubject] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("TEACHER");
  const [password, setPassword] = useState("demo123");

  // Remove confirm
  const [removeId, setRemoveId] = useState<string | null>(null);

  async function onboard() {
    startTransition(async () => {
      const res = await fetch("/api/portal/staff/onboard", {
        method: "POST",
        body: JSON.stringify({ name, email, designation, subject, phone, role, password, qualification: null }),
        headers: { "Content-Type": "application/json" },
      });
      const j = await res.json();
      toast({
        title: res.ok ? (lang === "te" ? "సిబ్బంది ఆన్‌బోర్డ్" : "Staff onboarded") : "Error",
        description: res.ok ? `${name} — ${role}` : j.error,
        variant: res.ok ? "default" : "destructive",
      });
      if (res.ok) {
        setName(""); setEmail(""); setSubject(""); setPhone(""); setRole("TEACHER"); setPassword("demo123");
        setOpen(false);
        router.refresh();
      }
    });
  }

  async function removeStaff(id: string) {
    startTransition(async () => {
      const res = await fetch(`/api/portal/staff/${id}`, { method: "POST" });
      const j = await res.json();
      toast({
        title: res.ok ? (lang === "te" ? "సిబ్బంది తొలగించబడ్డారు" : "Staff removed") : "Error",
        description: j.error,
        variant: res.ok ? "default" : "destructive",
      });
      if (res.ok) { setRemoveId(null); router.refresh(); }
    });
  }

  const activeStaff = staff.filter((s) => s.status !== "RETIRED");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{activeStaff.length} {lang === "te" ? "క్రియాశీల సిబ్బంది" : "active staff"}</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><UserPlus className="mr-1.5 h-4 w-4" />{lang === "te" ? "సిబ్బంది ఆన్‌బోర్డ్" : "Onboard staff"}</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto scroll-thin">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><UserPlus className="h-4 w-4" />{lang === "te" ? "కొత్త సిబ్బంది ఆన్‌బోర్డ్" : "Onboard New Staff"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Full name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. K. Rama Rao" /></div>
                <div><Label>Email *</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="name@zphsknp.edu.in" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Designation *</Label>
                  <Select value={designation} onValueChange={setDesignation}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["School Assistant", "SGT", "PET", "LHS", "Pandit", "Office Clerk"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Mathematics" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9848011xxx" /></div>
                <div>
                  <Label>Role *</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Password *</Label><Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="demo123" /></div>
              <p className="rounded-md bg-muted/40 p-2 text-xs text-muted-foreground">
                {lang === "te" ? "ఈ ఖాతా తక్షణమే సృష్టించబడి లాగిన్ చేయడానికి సిద్ధంగా ఉంటుంది." : "This account is created immediately and ready to log in."}
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={onboard} disabled={pending || !name || !email || !password}><UserPlus className="mr-1.5 h-4 w-4" />Onboard</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Staff list */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {activeStaff.map((s) => (
          <Card key={s.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold ${s.user?.role === "HM" ? "bg-amber-500/20 text-amber-400" : "bg-primary/10 text-primary"}`}>
                  {s.user?.role === "HM" ? <Crown className="h-4 w-4" /> : s.name[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{s.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{s.designation}{s.subject ? ` · ${s.subject}` : ""}</p>
                  {s.user && <p className="truncate text-[11px] text-muted-foreground">{s.user.email}</p>}
                </div>
                <Badge variant={s.status === "ACTIVE" ? "default" : "secondary"} className="text-[10px]">{s.status}</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between">
                {s.user && <Badge variant="outline" className="text-[10px]">{s.user.role}</Badge>}
                {s.user?.role !== "HM" && (
                  <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs text-destructive hover:text-destructive" onClick={() => setRemoveId(removeId === s.id ? null : s.id)}>
                    <UserMinus className="mr-1 h-3 w-3" />Remove
                  </Button>
                )}
              </div>
              {removeId === s.id && (
                <div className="mt-2 flex items-center gap-2 rounded-md bg-destructive/10 p-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                  <p className="flex-1 text-[11px] text-destructive">Confirm removal? Login will be disabled.</p>
                  <Button size="sm" variant="destructive" className="h-6 text-xs" onClick={() => removeStaff(s.id)} disabled={pending}>Yes</Button>
                  <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setRemoveId(null)}>No</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent onboardings */}
      {onboardings.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">{lang === "te" ? "ఇటీవలి ఆన్‌బోర్డింగ్‌లు" : "Recent Onboardings"}</CardTitle></CardHeader>
          <CardContent className="space-y-1.5">
            {onboardings.slice(0, 8).map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-md border border-border p-2 text-xs">
                <span className="font-medium">{o.name}</span>
                <span className="text-muted-foreground">{o.email}</span>
                <Badge variant="outline" className="text-[10px]">{o.role}</Badge>
                <span className="text-muted-foreground">{fmtDate(o.invitedAt, "en-GB", { day: "2-digit", month: "short" })}</span>
                <Badge variant={o.status === "COMPLETED" ? "default" : "secondary"} className="text-[10px]">{o.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── HM Handover component ─────────────────────────────────────────────
export function HMHandoverPanel({
  staff,
  schoolId,
  operatorId,
  handover,
}: {
  staff: StaffLite[];
  schoolId: string;
  operatorId: string;
  handover: StaffManagerProps["handover"];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { lang } = useI18n();
  const [pending, startTransition] = useTransition();
  const [authId, setAuthId] = useState("");
  const [note, setNote] = useState("");

  async function authorize() {
    startTransition(async () => {
      const res = await fetch("/api/portal/handover", {
        method: "POST",
        body: JSON.stringify({ authorizedUserId: authId, note }),
        headers: { "Content-Type": "application/json" },
      });
      const j = await res.json();
      toast({
        title: res.ok ? (lang === "te" ? "అధికారం ఇవ్వబడింది" : "Authorization granted") : "Error",
        description: res.ok ? (lang === "te" ? "కొత్త HM ను ఆన్‌బోర్డ్ చేయవచ్చు" : "New HM can now be onboarded") : j.error,
        variant: res.ok ? "default" : "destructive",
      });
      if (res.ok) { setAuthId(""); setNote(""); router.refresh(); }
    });
  }

  async function cancelHandover() {
    startTransition(async () => {
      const res = await fetch("/api/portal/handover", { method: "DELETE" });
      const j = await res.json();
      toast({ title: res.ok ? "Cancelled" : "Error", description: j.error, variant: res.ok ? "default" : "destructive" });
      if (res.ok) router.refresh();
    });
  }

  const isActive = handover?.status === "ACTIVE";
  const eligibleStaff = staff.filter((s) => s.status === "ACTIVE" && s.user?.role !== "HM" && s.user);

  return (
    <div className="space-y-4">
      <Card className={isActive ? "border-amber-500/40 bg-amber-500/5" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm"><Crown className="h-4 w-4 text-amber-500" />{lang === "te" ? "హెడ్‌మాస్టర్ హ్యాండోవర్" : "Headmaster Handover"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            {lang === "te"
              ? "మీరు బదిలీ అవుతున్నప్పుడు, కొత్త HM ను ఆన్‌బోర్డ్ చేయడానికి ఒక సిబ్బందికి అధికారం ఇవ్వండి. కొత్త HM ఆన్‌బోర్డ్ అయిన తర్వాత ఈ అధికారం స్వయంచాలకంగా నిలిపివేయబడుతుంది."
              : "When you are being transferred, authorize a staff member to onboard the next Headmaster. Once the new HM is onboarded, this authorization auto-disables."}
          </p>

          {isActive ? (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-500" />
                <p className="text-sm font-semibold text-amber-200">{lang === "te" ? "అధికారం క్రియాశీలంగా ఉంది" : "Authorization is ACTIVE"}</p>
              </div>
              <p className="mt-1.5 text-xs text-amber-100/80">
                {lang === "te" ? "అధికారం ఇచ్చినవారు" : "Authorized"}: <span className="font-semibold">{handover?.authorizedUser?.name}</span> ({handover?.authorizedUser?.email})
              </p>
              <p className="text-xs text-amber-100/60">{lang === "te" ? "వారు ఇప్పుడు కొత్త HM ను ఆన్‌బోర్డ్ చేయవచ్చు." : "They can now onboard the new Headmaster."}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={cancelHandover} disabled={pending}>
                <XCircle className="mr-1.5 h-3.5 w-3.5" />{lang === "te" ? "అధికారం రద్దు" : "Cancel authorization"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {handover?.status === "CONSUMED" && (
                <div className="flex items-center gap-2 rounded-md bg-green-500/10 p-2 text-xs text-green-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {lang === "te" ? "హ్యాండోవర్ పూర్తయింది — కొత్త HM ఆన్‌బోర్డ్ అయ్యారు." : "Handover complete — new HM has been onboarded."}
                </div>
              )}
              <div>
                <Label>{lang === "te" ? "ఎవరికి అధికారం ఇవ్వాలి?" : "Authorize who?"}</Label>
                <Select value={authId} onValueChange={setAuthId}>
                  <SelectTrigger><SelectValue placeholder={lang === "te" ? "సిబ్బందిని ఎంచుకోండి" : "Select a staff member"} /></SelectTrigger>
                  <SelectContent>
                    {eligibleStaff.map((s) => (
                      <SelectItem key={s.id} value={s.user!.id}>{s.name} — {s.designation} ({s.user!.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Note (optional)</Label>
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={lang === "te" ? "బదిలీ సందేశం" : "Transfer note"} />
              </div>
              <Button onClick={authorize} disabled={pending || !authId}>
                <ShieldCheck className="mr-1.5 h-4 w-4" />{lang === "te" ? "అధికారం ఇవ్వండి" : "Grant authorization"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Onboard new HM (visible to the authorized user, not the current HM) */}
      <OnboardHMPanel handover={handover} />
    </div>
  );
}

function OnboardHMPanel({ handover }: { handover: StaffManagerProps["handover"] }) {
  const router = useRouter();
  const { toast } = useToast();
  const { lang } = useI18n();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("demo123");

  const canOnboard = handover?.status === "ACTIVE";

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

  if (!canOnboard) return null;

  return (
    <Card className="border-green-500/30 bg-green-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm"><Crown className="h-4 w-4 text-green-500" />{lang === "te" ? "కొత్త హెడ్‌మాస్టర్ ఆన్‌బోర్డ్" : "Onboard New Headmaster"}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-xs text-muted-foreground">
          {lang === "te" ? "మీరు కొత్త HM ను ఆన్‌బోర్డ్ చేయడానికి అధికారం పొందారు. ఆన్‌బోర్డ్ అయిన తర్వాత ఈ ఎంపిక స్వయంచాలకంగా నిలిపివేయబడుతుంది." : "You are authorized to onboard the new Headmaster. After onboarding, this option auto-disables."}
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Crown className="mr-1.5 h-4 w-4" />{lang === "te" ? "కొత్త HM ఆన్‌బోర్డ్" : "Onboard new HM"}</Button>
          </DialogTrigger>
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
