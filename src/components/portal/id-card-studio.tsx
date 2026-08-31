"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n-provider";
import { PhotoEditor, type PhotoCrop } from "@/components/portal/photo-editor";
import { IDCardPair, IDCardFront, IDCardBack, type IDCardData } from "@/components/portal/id-card-design";
import { fmtDate } from "@/lib/date";
import { Camera, IdCard, CheckCircle2, Printer, RefreshCw, Eye, Download } from "lucide-react";

export interface IDCardRequestLite {
  id: string;
  status: string;
  cardType: string;
  photoUrl: string | null;
  cardNo: string | null;
  validityYear: string | null;
  issuedAt: string | Date | null;
  approvedAt: string | Date | null;
  student: {
    id: string;
    name: string;
    admissionNo: string;
    gender: string;
    dob: string | Date;
    bloodGroup: string | null;
    fatherName: string;
    motherName: string;
    emergencyContact: string | null;
    photoUrl: string | null;
    medium: string;
    rollNo: string | null;
    enrolments: { className: string; section: string }[];
  };
}

interface SchoolLite {
  name: string;
  nameTe: string | null;
  udise: string;
  address: string;
  phone: string;
  email: string;
}

type Role = "ID_OPERATOR" | "HM";

export function IdCardStudio({
  request,
  school,
  role,
}: {
  request: IDCardRequestLite;
  school: SchoolLite;
  role: Role;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { lang } = useI18n();
  const [pending, startTransition] = useTransition();
  const [photoOpen, setPhotoOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [photo, setPhoto] = useState<PhotoCrop | null>(
    request.photoUrl
      ? { dataUrl: request.photoUrl, zoom: 1, positionX: 0.5, positionY: 0.5 }
      : null
  );

  const enrolment = request.student.enrolments[0];
  const cardData: IDCardData = {
    studentName: request.student.name,
    admissionNo: request.student.admissionNo,
    className: enrolment?.className ?? "—",
    section: enrolment?.section ?? "",
    rollNo: request.student.rollNo,
    dob: request.student.dob,
    gender: request.student.gender,
    bloodGroup: request.student.bloodGroup,
    fatherName: request.student.fatherName,
    motherName: request.student.motherName,
    emergencyContact: request.student.emergencyContact,
    photoUrl: photo?.dataUrl ?? request.student.photoUrl ?? request.photoUrl,
    schoolName: school.name,
    schoolNameTe: school.nameTe,
    udise: school.udise,
    schoolAddress: school.address,
    schoolPhone: school.phone,
    schoolEmail: school.email,
    medium: request.student.medium,
    cardNo: request.cardNo,
    validityYear: request.validityYear,
    issuedAt: request.issuedAt,
  };

  const canEditPhoto = role === "ID_OPERATOR" && request.status !== "ISSUED";
  const canIssue = role === "HM" && (request.status === "APPROVED" || request.status === "PRINTED");
  const canReprint = role === "HM" && request.status === "ISSUED";

  async function savePhoto(p: PhotoCrop) {
    setPhoto(p);
    const res = await fetch(`/api/portal/id-card/${request.id}/photo`, {
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

  async function issue() {
    startTransition(async () => {
      const res = await fetch(`/api/portal/id-card/${request.id}/issue`, {
        method: "POST",
        body: JSON.stringify({ action: "issue" }),
        headers: { "Content-Type": "application/json" },
      });
      const j = await res.json();
      toast({
        title: res.ok ? (lang === "te" ? "ID కార్డు జారీ అయింది" : "ID card issued") : "Error",
        description: res.ok ? `${lang === "te" ? "కార్డ్ నెం." : "Card No."} ${j.cardNo}` : j.error,
        variant: res.ok ? "default" : "destructive",
      });
      if (res.ok) router.refresh();
    });
  }

  async function reprint() {
    startTransition(async () => {
      const res = await fetch(`/api/portal/id-card/${request.id}/issue`, {
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

  // Print the card using a hidden iframe-friendly print window.
  function printCard() {
    const w = window.open("", "_blank", "width=780,height=600");
    if (!w) {
      toast({ title: "Pop-up blocked", description: "Allow pop-ups to print the ID card.", variant: "destructive" });
      return;
    }
    const frontHtml = document.getElementById(`card-front-${request.id}`)?.innerHTML ?? "";
    const backHtml = document.getElementById(`card-back-${request.id}`)?.innerHTML ?? "";
    w.document.write(`<!doctype html><html><head><title>ID Card — ${request.student.name}</title>
    <style>
      @page { size: 54mm 86mm; margin: 0; }
      body { margin:0; font-family: -apple-system, system-ui, sans-serif; display:flex; gap:8px; padding:8px; }
      .card-wrap { width: 320px; height: 508px; overflow:hidden; }
      @media print { body { gap:0; } .no-print { display:none; } }
    </style></head><body>
      <div class="card-wrap">${frontHtml}</div>
      <div class="card-wrap">${backHtml}</div>
      <div class="no-print" style="position:fixed;bottom:8px;left:8px;">
        <button onclick="window.print()" style="padding:8px 14px;background:#1f6f43;color:#fff;border:none;border-radius:6px;cursor:pointer;">Print ID Card</button>
      </div>
    </body></html>`);
    w.document.close();
  }

  const STATUS_TONE: Record<string, "default" | "success" | "warning" | "danger"> = {
    DRAFT: "default", SUBMITTED: "warning", APPROVED: "success", REJECTED: "danger", PRINTED: "default", ISSUED: "success",
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {request.student.name[0]}
          </span>
          <div>
            <p className="text-sm font-semibold">{request.student.name}</p>
            <p className="text-xs text-muted-foreground">{request.student.admissionNo} · {enrolment?.className}-{enrolment?.section} · {request.cardType}</p>
            {request.cardNo && <p className="font-mono text-[11px] text-muted-foreground">{request.cardNo}</p>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={STATUS_TONE[request.status] ?? "default"}>{request.status}</Badge>
          {request.issuedAt && <span className="text-[11px] text-muted-foreground">{lang === "te" ? "జారీ" : "Issued"} {fmtDate(request.issuedAt, "en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Live mini preview */}
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-muted/20 p-4">
          <p className="self-start text-xs font-semibold uppercase tracking-wider text-muted-foreground">{lang === "te" ? "ID కార్డ్ ప్రివ్యూ" : "ID Card Preview"}</p>
          <div className="origin-top scale-[0.6] sm:scale-75">
            <IDCardFront d={cardData} />
          </div>
          <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
            <Eye className="mr-1.5 h-3.5 w-3.5" />{lang === "te" ? "పూర్తి కార్డ్ చూడండి" : "View full card"}
          </Button>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-border p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold"><Camera className="h-3.5 w-3.5 text-primary" />{lang === "te" ? "ఫోటో" : "Photo"}</p>
            <div className="mt-2 flex items-center gap-2">
              {photo || request.student.photoUrl || request.photoUrl ? (
                 
                <img src={photo?.dataUrl ?? request.student.photoUrl ?? request.photoUrl ?? ""} alt="Student" className="h-16 w-12 rounded border border-border object-cover" />
              ) : (
                <div className="grid h-16 w-12 place-items-center rounded border border-dashed border-border bg-muted/30 text-muted-foreground"><Camera className="h-4 w-4" /></div>
              )}
              <div className="flex-1">
                <p className="text-[11px] text-muted-foreground">
                  {photo || request.student.photoUrl || request.photoUrl ? (lang === "te" ? "ఫోటో అమలులో ఉంది" : "Photo attached") : (lang === "te" ? "ఫోటో లేదు" : "No photo yet")}
                </p>
                <Button variant="outline" size="sm" className="mt-1" disabled={!canEditPhoto} onClick={() => setPhotoOpen(true)}>
                  <Camera className="mr-1.5 h-3.5 w-3.5" />
                  {canEditPhoto ? (lang === "te" ? "ఫోటో సవరించు" : "Adjust photo") : (lang === "te" ? "సవరించలేరు" : "Locked")}
                </Button>
              </div>
            </div>
          </div>

          {role === "HM" && (
            <div className="rounded-lg border border-border p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold"><IdCard className="h-3.5 w-3.5 text-primary" />{lang === "te" ? "జారీ చర్యలు" : "Issuance Actions"}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button size="sm" disabled={!canIssue || pending} onClick={issue}>
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />{lang === "te" ? "జారీ చేయి" : "Issue card"}
                </Button>
                <Button size="sm" variant="outline" disabled={!canReprint || pending} onClick={reprint}>
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />{lang === "te" ? "రీప్రింట్" : "Reprint"}
                </Button>
                <Button size="sm" variant="outline" disabled={request.status !== "ISSUED"} onClick={printCard}>
                  <Printer className="mr-1.5 h-3.5 w-3.5" />{lang === "te" ? "ప్రింట్" : "Print"}
                </Button>
              </div>
              {!canIssue && !canReprint && (
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  {request.status === "SUBMITTED" ? (lang === "te" ? "ముందుగా అభ్యర్థనను ఆమోదించండి." : "Approve the request first.") : request.status === "ISSUED" ? (lang === "te" ? "కార్డు ఇప్పటికే జారీ అయింది." : "Card already issued.") : ""}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hidden full-size card render for printing */}
      <div className="hidden">
        <div id={`card-front-${request.id}`}><IDCardFront d={cardData} /></div>
        <div id={`card-back-${request.id}`}><IDCardBack d={cardData} /></div>
      </div>

      {/* Photo editor dialog */}
      <Dialog open={photoOpen} onOpenChange={setPhotoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Camera className="h-4 w-4" />{lang === "te" ? "ఫోటో సవరణ" : "Photo Adjustment"}</DialogTitle>
          </DialogHeader>
          <PhotoEditor
            initialPhoto={photo?.dataUrl ?? request.student.photoUrl ?? request.photoUrl}
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
            <DialogTitle className="flex items-center gap-2"><IdCard className="h-4 w-4" />{request.student.name} — ID Card</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="both">
            <TabsList>
              <TabsTrigger value="both">{lang === "te" ? "రెండూ" : "Both sides"}</TabsTrigger>
              <TabsTrigger value="front">{lang === "te" ? "ముందు" : "Front"}</TabsTrigger>
              <TabsTrigger value="back">{lang === "te" ? "వెనుక" : "Back"}</TabsTrigger>
            </TabsList>
            <TabsContent value="both" className="mt-4 flex flex-wrap justify-center gap-4"><IDCardPair d={cardData} /></TabsContent>
            <TabsContent value="front" className="mt-4 flex justify-center"><IDCardFront d={cardData} /></TabsContent>
            <TabsContent value="back" className="mt-4 flex justify-center"><IDCardBack d={cardData} /></TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={printCard} disabled={request.status !== "ISSUED"}>
              <Printer className="mr-1.5 h-4 w-4" />{lang === "te" ? "ప్రింట్" : "Print"}
            </Button>
            <Button variant="outline" asChild>
              <a href={photo?.dataUrl ?? request.student.photoUrl ?? "#"} download={`photo-${request.student.admissionNo}.jpg`}>
                <Download className="mr-1.5 h-4 w-4" />{lang === "te" ? "ఫోటో" : "Photo"}
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
