"use client";

import { QRCodeSVG } from "qrcode.react";
import { GraduationCap, Phone, MapPin, RotateCw } from "lucide-react";

export interface IDCardData {
  // student
  studentName: string;
  admissionNo: string;
  sid?: string | null; // SID-10-A-01
  className: string; // Roman: VI..X
  section: string;
  rollNo?: string | null;
  dob: string | Date;
  gender: string;
  bloodGroup?: string | null;
  fatherName: string;
  motherName: string;
  emergencyContact?: string | null;
  photoUrl?: string | null;
  // school
  schoolName: string;
  schoolNameTe?: string | null;
  udise: string;
  schoolAddress: string;
  schoolPhone: string;
  schoolEmail: string;
  medium: string;
  // card
  cardNo?: string | null;
  sidSnapshot?: string | null;
  validityYear?: string | null;
  validTill?: string | null;
  issuedAt?: string | Date | null;
}

// CR80 PVC card: 54 × 85.6 mm. Rendered at 320×508px (≈1:1.5875 ratio).
const CARD_W = 320;
const CARD_H = 508;

// Roman class mapping for display
const ROMAN: Record<string, string> = { VI: "VI", VII: "VII", VIII: "VIII", IX: "IX", X: "X" };

// ─── FRONT ─────────────────────────────────────────────────────────────
export function IDCardFront({ d }: { d: IDCardData }) {
  const romanClass = ROMAN[d.className] ?? d.className;
  const cardNoDisplay = d.cardNo ?? "DRAFT";
  const isDraft = !d.cardNo;
  const sidDisplay = d.sidSnapshot ?? d.sid ?? "—";

  return (
    <div
      className="relative overflow-hidden rounded-xl bg-white font-sans shadow-xl ring-1 ring-black/5"
      style={{ width: CARD_W, height: CARD_H }}
    >
      {/* Government header */}
      <div className="px-4 pt-3 text-center">
        <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-neutral-500">
          Government of Andhra Pradesh
        </p>
        <p className="mt-0.5 text-[12px] font-extrabold leading-tight text-neutral-900">
          {d.schoolName}
        </p>
        <p className="text-[7px] uppercase tracking-wider text-neutral-400">
          School Identity Card · {d.validityYear ?? "2025-26"}
        </p>
      </div>

      {/* Tricolour strip */}
      <div className="mt-2 flex h-1.5 w-full">
        <div className="flex-1" style={{ backgroundColor: "#FF9933" }} />
        <div className="flex-1 bg-white" />
        <div className="flex-1" style={{ backgroundColor: "#138808" }} />
      </div>

      {/* Photo — 2×2 square */}
      <div className="mt-4 flex justify-center">
        <div
          className="overflow-hidden rounded-md border-2 border-white bg-neutral-200 shadow-md ring-1 ring-black/10"
          style={{ width: 110, height: 110 }}
        >
          {d.photoUrl ? (
            <img src={d.photoUrl} alt={d.studentName} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-neutral-400">
              <GraduationCap className="h-8 w-8" />
            </div>
          )}
        </div>
      </div>

      {/* Name */}
      <div className="mt-3 px-4 text-center">
        <p className="text-[14px] font-extrabold uppercase leading-tight tracking-wide text-neutral-900">
          {d.studentName}
        </p>
      </div>

      {/* Details */}
      <div className="mt-3 px-5">
        <div className="space-y-1">
          <Row k="Student ID" v={sidDisplay} mono />
          <Row k="Class" v={`${romanClass}-${d.section}`} />
          <Row k="Gender" v={d.gender} />
          <Row k="Admission No" v={d.admissionNo} mono />
          <Row k="Valid Till" v={d.validTill ?? "31 Mar 2026"} />
        </div>
      </div>

      {/* Footer: UDISE + card no + QR */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between border-t border-neutral-100 bg-neutral-50 px-3 py-2">
        <div className="min-w-0">
          <p className="text-[6.5px] uppercase tracking-wider text-neutral-400">UDISE</p>
          <p className="font-mono text-[8px] font-bold text-neutral-700">{d.udise}</p>
          <p className="mt-0.5 text-[6.5px] uppercase tracking-wider text-neutral-400">Card No</p>
          <p className={`font-mono text-[8.5px] font-bold ${isDraft ? "text-amber-600" : "text-neutral-700"}`}>
            {cardNoDisplay}
          </p>
        </div>
        <div className="rounded bg-white p-0.5 ring-1 ring-black/5">
          <QRCodeSVG
            value={JSON.stringify({ sid: sidDisplay, n: d.studentName, c: `${romanClass}-${d.section}`, u: d.udise, card: cardNoDisplay })}
            size={44}
            level="M"
            fgColor="#1f2937"
          />
        </div>
      </div>
    </div>
  );
}

// ─── BACK ──────────────────────────────────────────────────────────────
export function IDCardBack({ d }: { d: IDCardData }) {
  return (
    <div
      className="relative overflow-hidden rounded-xl bg-white font-sans shadow-xl ring-1 ring-black/5"
      style={{ width: CARD_W, height: CARD_H }}
    >
      {/* Tricolour strip (top) */}
      <div className="flex h-1.5 w-full">
        <div className="flex-1" style={{ backgroundColor: "#FF9933" }} />
        <div className="flex-1 bg-white" />
        <div className="flex-1" style={{ backgroundColor: "#138808" }} />
      </div>

      {/* Magnetic stripe */}
      <div className="mt-3 h-7 w-full bg-neutral-800" />

      <div className="px-5 pt-4">
        {/* School identity */}
        <div className="text-center">
          <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-700">{d.schoolName}</p>
          <p className="text-[7px] text-neutral-400">{d.schoolNameTe ?? ""}</p>
        </div>

        {/* Return-if-found box */}
        <div className="mt-3 rounded-lg border border-dashed border-neutral-300 p-3">
          <p className="text-center text-[7.5px] font-bold uppercase tracking-wider text-neutral-500">
            If found, please return to
          </p>
          <div className="mt-1.5 flex items-start gap-1.5">
            <MapPin className="mt-0.5 h-2.5 w-2.5 shrink-0 text-neutral-400" />
            <p className="text-[7.5px] leading-snug text-neutral-600">{d.schoolAddress}</p>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <Phone className="h-2.5 w-2.5 shrink-0 text-neutral-400" />
            <p className="text-[7.5px] font-semibold text-neutral-600">{d.schoolPhone}</p>
          </div>
        </div>

        {/* Emergency contact */}
        <div className="mt-3 rounded-md bg-amber-50 p-2">
          <p className="text-[7px] font-bold uppercase tracking-wider text-amber-700">Emergency Contact</p>
          <p className="mt-0.5 text-[8px] text-amber-900">
            {d.fatherName} · <span className="font-mono font-semibold">{d.emergencyContact ?? "—"}</span>
          </p>
        </div>

        {/* Disclaimer */}
        <div className="mt-3 text-center">
          <p className="text-[6.5px] leading-snug text-neutral-400">
            This is a school identity card for internal use only.
            <br />Not a government identity document.
          </p>
        </div>

        {/* Signature */}
        <div className="mt-4 flex items-end justify-between">
          <div className="text-center">
            <div className="h-5 w-20 border-b border-neutral-400" />
            <p className="mt-0.5 text-[6.5px] uppercase text-neutral-400">Headmaster</p>
          </div>
          <div className="text-right">
            <p className="text-[6.5px] text-neutral-400">UDISE: {d.udise}</p>
            {d.cardNo && <p className="font-mono text-[6.5px] font-bold text-neutral-500">{d.cardNo}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-100 py-0.5">
      <span className="text-[7.5px] uppercase tracking-wider text-neutral-400">{k}</span>
      <span className={`text-[9px] font-bold text-neutral-800 ${mono ? "font-mono" : ""}`}>{v}</span>
    </div>
  );
}

// Combined front + back display
export function IDCardPair({ d, side = "both" }: { d: IDCardData; side?: "front" | "back" | "both" }) {
  if (side === "front") return <IDCardFront d={d} />;
  if (side === "back") return <IDCardBack d={d} />;
  return (
    <div className="flex flex-wrap gap-4">
      <IDCardFront d={d} />
      <IDCardBack d={d} />
    </div>
  );
}
