"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhotoEditor, type PhotoCrop } from "@/components/portal/photo-editor";
import { IDCardFront, IDCardBack, type IDCardData } from "@/components/portal/id-card-design";
import { fmtDate } from "@/lib/date";
import {
  Search, Camera, IdCard, CheckCircle2, Printer, RotateCw, Eye, User, Filter,
  ShieldCheck, Plus, X,
} from "lucide-react";

export interface StudentLite {
  id: string;
  name: string;
  admissionNo: string;
  sid: string | null;
  gender: string;
  bloodGroup: string | null;
  fatherName: string;
  motherName: string;
  emergencyContact: string | null;
  photoUrl: string | null;
  medium: string;
  rollNo: string | null;
  dob: string | Date;
  enrolments: { className: string; section: string }[];
}

export interface RequestLite {
  id: string;
  status: string;
  cardType: string;
  photoUrl: string | null;
  cardNo: string | null;
  sidSnapshot: string | null;
  validityYear: string | null;
  validTill: string | null;
  issuedAt: string | Date | null;
  student: StudentLite;
}

interface SchoolLite {
  name: string;
  nameTe: string | null;
  udise: string;
  address: string;
  phone: string;
  email: string;
}

const CLASSES = ["all", "VI", "VII", "VIII", "IX", "X"];
const SECTIONS = ["all", "A", "B", "C"];

export function IssuanceDesk({
  students,
  requests,
  school,
  operatorId,
}: {
  students: StudentLite[];
  requests: RequestLite[];
  school: SchoolLite;
  operatorId: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { lang } = useI18n();
  const [pending, startTransition] = useTransition();

  // Filters
  const [fClass, setFClass] = useState("all");
  const [fSection, setFSection] = useState("all");
  const [fName, setFName] = useState("");
  const [fSid, setFSid] = useState("");

  // Selected student + their active request
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Photo editor dialog
  const [photoOpen, setPhotoOpen] = useState(false);
  const [photo, setPhoto] = useState<PhotoCrop | null>(null);

  // Card preview dialog
  const [previewOpen, setPreviewOpen] = useState(false);

  // New request creation
  const [newCardType, setNewCardType] = useState("NEW");

  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (fClass !== "all" && s.enrolments[0]?.className !== fClass) return false;
      if (fSection !== "all" && s.enrolments[0]?.section !== fSection) return false;
      if (fName && !s.name.toLowerCase().includes(fName.toLowerCase())) return false;
      if (fSid && s.sid !== fSid.toUpperCase()) return false;
      return true;
    });
  }, [students, fClass, fSection, fName, fSid]);

  const selected = students.find((s) => s.id === selectedId) ?? null;
  // Find the student's ID card requests (newest first)
  const selectedRequests = requests.filter((r) => r.student.id === selectedId);
  // The "active" request is the one we're working on (SUBMITTED or ISSUED)
  const activeRequest = selectedRequests.find((r) => r.status === "SUBMITTED") ?? selectedRequests[0] ?? null;

  // Build card data for preview
  function buildCardData(req: RequestLite | null): IDCardData | null {
    if (!selected) return null;
    const enrolment = selected.enrolments[0];
    return {
      studentName: selected.name,
      admissionNo: selected.admissionNo,
      sid: selected.sid,
      className: enrolment?.className ?? "—",
      section: enrolment?.section ?? "",
      rollNo: selected.rollNo,
      dob: selected.dob,
      gender: selected.gender,
      bloodGroup: selected.bloodGroup,
      fatherName: selected.fatherName,
      motherName: selected.motherName,
      emergencyContact: selected.emergencyContact,
      photoUrl: photo?.dataUrl ?? req?.photoUrl ?? selected.photoUrl,
      schoolName: school.name,
      schoolNameTe: school.nameTe,
      udise: school.udise,
      schoolAddress: school.address,
      schoolPhone: school.phone,
      schoolEmail: school.email,
      medium: selected.medium,
      cardNo: req?.cardNo ?? null,
      sidSnapshot: req?.sidSnapshot ?? selected.sid,
      validityYear: req?.validityYear ?? "2025-26",
      validTill: req?.validTill ?? "31 Mar 2026",
      issuedAt: req?.issuedAt ?? null,
    };
  }

  const cardData = buildCardData(activeRequest);
  const hasPhoto = !!(photo?.dataUrl ?? activeRequest?.photoUrl ?? selected?.photoUrl);
  const hasStudent = !!selected;
  const isIssued = activeRequest?.status === "ISSUED";

  // Create a new request for the selected student (if none exists)
  async function ensureRequest(): Promise<string | null> {
    if (!selected) return null;
    if (activeRequest) return activeRequest.id;
    // create one
    const res = await fetch("/api/portal/id-card", {
      method: "POST",
      body: JSON.stringify({ studentId: selected.id, schoolId: school.id, cardType: newCardType }),
      headers: { "Content-Type": "application/json" },
    });
    const j = await res.json();
    if (res.ok) {
      router.refresh();
      return j.request.id;
    }
    toast({ title: "Error", description: j.error, variant: "destructive" });
    return null;
  }

  async function savePhoto(p: PhotoCrop) {
    setPhoto(p);
    const reqId = await ensureRequest();
    if (!reqId) return;
    const res = await fetch(`/api/portal/id-card/${reqId}/photo`, {
      method: "POST",
      body: JSON.stringify({ photoUrl: p.dataUrl, zoom: p.zoom, positionX: p.positionX, positionY: p.positionY }),
      headers: { "Content-Type": "application/json" },
    });
    const j = await res.json();
    toast({
      title: res.ok ? (lang === "te" ? "ఫోటో సేవ్ అయింది" : "Photo saved") : "Error",
      description: j.error,
      variant: res.ok ? "default" : "destructive",
    });
    if (res.ok) { setPhotoOpen(false); router.refresh(); }
  }

  async function issueCard() {
    const reqId = await ensureRequest();
    if (!reqId) return;
    startTransition(async () => {
      const res = await fetch(`/api/portal/id-card/${reqId}/issue`, {
        method: "POST",
        body: JSON.stringify({ action: "issue" }),
        headers: { "Content-Type": "application/json" },
      });
      const j = await res.json();
      toast({
        title: res.ok ? (lang === "te" ? "ID కార్డు జారీ అయింది" : "Identity card issued") : "Error",
        description: res.ok ? `${lang === "te" ? "కార్డ్ నెం." : "Card No."} ${j.cardNo}` : j.error,
        variant: res.ok ? "default" : "destructive",
      });
      if (res.ok) router.refresh();
    });
  }

  async function reprintCard() {
    if (!activeRequest) return;
    startTransition(async () => {
      const res = await fetch(`/api/portal/id-card/${activeRequest.id}/issue`, {
        method: "POST",
        body: JSON.stringify({ action: "reprint" }),
        headers: { "Content-Type": "application/json" },
      });
      const j = await res.json();
      toast({
        title: res.ok ? (lang === "te" ? "రీప్రింట్ నమోదైంది" : "Reprint recorded") : "Error",
        description: j.error,
        variant: res.ok ? "default" : "destructive",
      });
      if (res.ok) router.refresh();
    });
  }

  function printCard() {
    if (!cardData) return;
    const w = window.open("", "_blank", "width=780,height=600");
    if (!w) {
      toast({ title: "Pop-up blocked", description: "Allow pop-ups to print the ID card.", variant: "destructive" });
      return;
    }
    // Render hidden full-size cards, read their HTML, write to print window.
    const frontEl = document.getElementById("print-card-front");
    const backEl = document.getElementById("print-card-back");
    const frontHtml = frontEl?.innerHTML ?? "";
    const backHtml = backEl?.innerHTML ?? "";
    w.document.write(`<!doctype html><html><head><title>ID Card — ${cardData.studentName}</title>
    <style>
      @page { size: 54mm 85.6mm; margin: 0; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      body { margin:0; font-family: -apple-system, system-ui, sans-serif; display:flex; flex-direction:column; gap:4mm; padding:2mm; }
      .card-wrap { width: 320px; height: 508px; overflow:hidden; transform: scale(0.9); transform-origin: top left; }
      @media print { body { gap:0; padding:0; } .no-print { display:none; } .card-wrap { transform: none; } }
    </style></head><body>
      <div class="card-wrap">${frontHtml}</div>
      <div class="card-wrap">${backHtml}</div>
      <div class="no-print" style="position:fixed;bottom:8px;left:8px;">
        <button onclick="window.print()" style="padding:8px 14px;background:#1f6f43;color:#fff;border:none;border-radius:6px;cursor:pointer;">Print ID Card (CR80)</button>
      </div>
    </body></html>`);
    w.document.close();
  }

  const STATUS_TONE: Record<string, "default" | "success" | "warning" | "danger"> = {
    DRAFT: "default", SUBMITTED: "warning", APPROVED: "success", REJECTED: "danger", PRINTED: "default", ISSUED: "success",
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
      {/* ─── Left: Student register ─── */}
      <div className="space-y-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm"><Filter className="h-4 w-4" />{lang === "te" ? "విద్యార్థి వేటాడండి" : "Find Pupil"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[11px]">{lang === "te" ? "తరగతి" : "Class"}</Label>
                <Select value={fClass} onValueChange={setFClass}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CLASSES.map((c) => <SelectItem key={c} value={c}>{c === "all" ? "All" : c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[11px]">{lang === "te" ? "విభాగం" : "Section"}</Label>
                <Select value={fSection} onValueChange={setFSection}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SECTIONS.map((s) => <SelectItem key={s} value={s}>{s === "all" ? "All" : s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-[11px]">{lang === "te" ? "పేరు" : "Name"}</Label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input value={fName} onChange={(e) => setFName(e.target.value)} placeholder="Partial name" className="h-8 pl-7 text-xs" />
              </div>
            </div>
            <div>
              <Label className="text-[11px]">{lang === "te" ? "విద్యార్థి ID" : "Student ID"}</Label>
              <Input value={fSid} onChange={(e) => setFSid(e.target.value.toUpperCase())} placeholder="SID-10-A-01" className="h-8 font-mono text-xs uppercase" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="border-b border-border px-3 py-2 text-xs font-semibold text-muted-foreground">
              {filtered.length} {lang === "te" ? "విద్యార్థులు" : "students"}
            </div>
            <div className="max-h-[28rem] overflow-y-auto scroll-thin">
              {filtered.map((s) => {
                const req = requests.find((r) => r.student.id === s.id);
                const isSel = s.id === selectedId;
                return (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedId(s.id); setPhoto(null); }}
                    className={`flex w-full items-center gap-2.5 border-b border-border p-2.5 text-left transition-colors ${isSel ? "bg-primary/10" : "hover:bg-muted/50"}`}
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {s.name[0]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">{s.name}</p>
                      <p className="truncate font-mono text-[10px] text-muted-foreground">{s.sid ?? s.admissionNo}</p>
                    </div>
                    {req && <Badge variant={STATUS_TONE[req.status] ?? "default"} className="text-[9px]">{req.status}</Badge>}
                  </button>
                );
              })}
              {filtered.length === 0 && <p className="p-4 text-center text-xs text-muted-foreground">{lang === "te" ? "ఫలితాలు లేవు" : "No students found"}</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Right: Photo + Preview + Issue ─── */}
      <div className="space-y-4">
        {!selected ? (
          <Card className="grid min-h-[24rem] place-items-center">
            <div className="text-center text-muted-foreground">
              <User className="mx-auto h-10 w-10 opacity-40" />
              <p className="mt-2 text-sm">{lang === "te" ? "విద్యార్థిని ఎంచుకోండి" : "Select a pupil from the register"}</p>
            </div>
          </Card>
        ) : (
          <>
            {/* Student header */}
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">{selected.name[0]}</span>
                  <div>
                    <p className="text-sm font-bold">{selected.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{selected.sid ?? "No SID"} · {selected.enrolments[0]?.className}-{selected.enrolments[0]?.section}</p>
                    <p className="text-[11px] text-muted-foreground">{selected.admissionNo} · {selected.gender} · {selected.bloodGroup ?? "—"}</p>
                  </div>
                </div>
                {activeRequest && (
                  <div className="text-right">
                    <Badge variant={STATUS_TONE[activeRequest.status] ?? "default"}>{activeRequest.status}</Badge>
                    {activeRequest.cardNo && <p className="mt-1 font-mono text-xs font-bold">{activeRequest.cardNo}</p>}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Photo section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm"><Camera className="h-4 w-4" />{lang === "te" ? "ఫోటో (2x2)" : "Photograph (2x2)"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    {hasPhoto ? (
                      <img src={photo?.dataUrl ?? activeRequest?.photoUrl ?? selected.photoUrl ?? ""} alt="Student" className="h-24 w-24 rounded-lg border-2 border-border object-cover" />
                    ) : (
                      <div className="grid h-24 w-24 place-items-center rounded-lg border-2 border-dashed border-border bg-muted/30 text-muted-foreground">
                        <Camera className="h-7 w-7" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <Button className="w-full" size="sm" disabled={isIssued} onClick={() => setPhotoOpen(true)}>
                        <Camera className="mr-1.5 h-3.5 w-3.5" />
                        {hasPhoto ? (lang === "te" ? "ఫోటో మార్చు" : "Replace photo") : (lang === "te" ? "ఫోటో తీయండి" : "Take / Upload")}
                      </Button>
                      {hasPhoto && (
                        <p className="text-[11px] text-muted-foreground">
                          {lang === "te" ? "2x2 చతురస్రం క్రాప్ సిద్ధం" : "2x2 square crop ready"}
                        </p>
                      )}
                      {isIssued && <p className="text-[11px] text-amber-600">{lang === "te" ? "కార్డు జారీ అయింది — ఫోటో లాక్" : "Card issued — photo locked"}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm"><IdCard className="h-4 w-4" />{lang === "te" ? "జారీ" : "Issue"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" disabled={!hasStudent || !hasPhoto || isIssued || pending} onClick={issueCard}>
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                    {isIssued ? (lang === "te" ? "జారీ అయింది" : "Already issued") : (lang === "te" ? "ఐడెంటిటీ కార్డు జారీ చేయి" : "Issue identity card")}
                  </Button>
                  {!hasPhoto && <p className="text-center text-[11px] text-muted-foreground">{lang === "te" ? "ముందుగా ఫోటో తీయండి" : "Take a photo first"}</p>}
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" disabled={!isIssued || pending} onClick={reprintCard}>
                      <RotateCw className="mr-1 h-3.5 w-3.5" />{lang === "te" ? "రీప్రింట్" : "Reprint"}
                    </Button>
                    <Button variant="outline" size="sm" disabled={!isIssued} onClick={printCard}>
                      <Printer className="mr-1 h-3.5 w-3.5" />{lang === "te" ? "ప్రింట్" : "Print"}
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full" disabled={!cardData} onClick={() => setPreviewOpen(true)}>
                    <Eye className="mr-1.5 h-3.5 w-3.5" />{lang === "te" ? "పూర్తి కార్డ్ చూడండి" : "View full card"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Live card preview */}
            {cardData && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{lang === "te" ? "లైవ్ కార్డ్ ప్రివ్యూ" : "Live Card Preview"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <div className="origin-top-left scale-[0.6]">
                      <IDCardFront d={cardData} />
                    </div>
                    <div className="origin-top-left scale-[0.6]">
                      <IDCardBack d={cardData} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recently issued for this pupil */}
            {selectedRequests.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{lang === "te" ? "ఈ విద్యార్థికి జారీ అయిన కార్డులు" : "Recently Issued — This Pupil"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedRequests.map((r) => (
                    <div key={r.id} className="flex items-center gap-3 rounded-md border border-border p-2.5">
                      {r.photoUrl ? (
                        <img src={r.photoUrl} alt={r.student.name} className="h-12 w-12 rounded border border-border object-cover" />
                      ) : (
                        <div className="grid h-12 w-12 place-items-center rounded border border-dashed border-border bg-muted/30 text-muted-foreground"><IdCard className="h-4 w-4" /></div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{r.student.name}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">{r.sidSnapshot ?? r.student.sid} · {r.cardNo ?? "DRAFT"}</p>
                        {r.issuedAt && <p className="text-[10px] text-muted-foreground">{lang === "te" ? "జారీ" : "Issued"} {fmtDate(r.issuedAt, "en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>}
                      </div>
                      <Badge variant={STATUS_TONE[r.status] ?? "default"}>{r.status}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Hidden full-size cards for printing */}
      {cardData && (
        <div className="hidden">
          <div id="print-card-front"><IDCardFront d={cardData} /></div>
          <div id="print-card-back"><IDCardBack d={cardData} /></div>
        </div>
      )}

      {/* Photo editor dialog */}
      <Dialog open={photoOpen} onOpenChange={setPhotoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Camera className="h-4 w-4" />{lang === "te" ? "ఫోటో — 2x2 చతురస్రం" : "Photograph — 2x2 Square"}</DialogTitle>
          </DialogHeader>
          <PhotoEditor
            initialPhoto={photo?.dataUrl ?? activeRequest?.photoUrl ?? selected?.photoUrl}
            initialZoom={photo?.zoom}
            onConfirm={savePhoto}
            onCancel={() => setPhotoOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Full card preview dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><IdCard className="h-4 w-4" />{selected?.name} — ID Card</DialogTitle>
          </DialogHeader>
          {cardData && (
            <Tabs defaultValue="both">
              <TabsList>
                <TabsTrigger value="both">{lang === "te" ? "రెండూ" : "Both"}</TabsTrigger>
                <TabsTrigger value="front">{lang === "te" ? "ముందు" : "Front"}</TabsTrigger>
                <TabsTrigger value="back">{lang === "te" ? "వెనుక" : "Back"}</TabsTrigger>
              </TabsList>
              <TabsContent value="both" className="mt-4 flex flex-wrap justify-center gap-4">
                <IDCardFront d={cardData} />
                <IDCardBack d={cardData} />
              </TabsContent>
              <TabsContent value="front" className="mt-4 flex justify-center"><IDCardFront d={cardData} /></TabsContent>
              <TabsContent value="back" className="mt-4 flex justify-center"><IDCardBack d={cardData} /></TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={printCard} disabled={!isIssued}>
              <Printer className="mr-1.5 h-4 w-4" />{lang === "te" ? "ప్రింట్ (CR80)" : "Print (CR80)"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
