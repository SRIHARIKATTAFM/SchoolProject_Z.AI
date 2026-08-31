"use client";

import { QRCodeSVG } from "qrcode.react";
import { GraduationCap, Phone, MapPin, AlertCircle, ShieldCheck } from "lucide-react";
import { fmtDate } from "@/lib/date";

export interface IDCardData {
  // student
  studentName: string;
  admissionNo: string;
  className: string;
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
  validityYear?: string | null;
  issuedAt?: string | Date | null;
}

// Modern dual-sided ID card. Uses print-safe fixed pixel sizing (crisp ratio ≈ credit card 1.585:1).
// Sized at 320×508pt per side → renders identically on screen and in print/PDF.

const CARD_W = 320;
const CARD_H = 508;

export function IDCardFront({ d }: { d: IDCardData }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-white font-sans shadow-xl ring-1 ring-black/5"
      style={{ width: CARD_W, height: CARD_H }}
    >
      {/* Header band — gradient + school brand */}
      <div
        className="relative flex items-center gap-2 px-4 py-3 text-white"
        style={{ background: "linear-gradient(135deg, #1f6f43 0%, #2f9d63 55%, #6cbf59 100%)" }}
      >
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/20 backdrop-blur">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-bold leading-tight">{d.schoolName}</p>
          <p className="text-[8px] uppercase tracking-wider opacity-85">Identity Card · 2024-25</p>
        </div>
      </div>

      {/* decorative wave */}
      <svg className="absolute left-0 right-0 top-[58px] w-full" height="14" viewBox="0 0 320 14" preserveAspectRatio="none" fill="none">
        <path d="M0 7 Q 80 0 160 7 T 320 7 V14 H0 Z" fill="#2f9d63" opacity="0.12" />
      </svg>

      {/* Photo */}
      <div className="mt-5 flex justify-center">
        <div
          className="overflow-hidden rounded-xl border-2 border-white bg-neutral-200 shadow-md ring-2 ring-[#2f9d63]/30"
          style={{ width: 116, height: 152 }}
        >
          {d.photoUrl ? (
             
            <img src={d.photoUrl} alt={d.studentName} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-neutral-400">
              <GraduationCap className="h-10 w-10" />
            </div>
          )}
        </div>
      </div>

      {/* Name + class */}
      <div className="mt-3 px-4 text-center">
        <p className="text-[15px] font-extrabold leading-tight text-neutral-900">{d.studentName}</p>
        <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[#e7f5ec] px-2.5 py-0.5 text-[9px] font-bold text-[#1f6f43]">
          Class {d.className} · {d.section} {d.rollNo ? `· Roll ${d.rollNo}` : ""}
        </div>
      </div>

      {/* Details grid */}
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 px-4 text-[8.5px]">
        <Detail label="Adm. No." value={d.admissionNo} />
        <Detail label="Gender" value={d.gender} />
        <Detail label="D.O.B" value={fmtDate(d.dob, "en-GB", { day: "2-digit", month: "short", year: "numeric" })} />
        <Detail label="Blood" value={d.bloodGroup ?? "—"} highlight={!!d.bloodGroup} />
        <Detail label="Father" value={d.fatherName} full />
        <Detail label="Medium" value={d.medium} />
        <Detail label="UDISE" value={d.udise} />
      </div>

      {/* Footer — card no + QR + validity */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between border-t border-neutral-100 bg-neutral-50 px-3 py-2">
        <div>
          <p className="text-[7px] uppercase tracking-wider text-neutral-400">Card No.</p>
          <p className="font-mono text-[8.5px] font-bold text-neutral-700">{d.cardNo ?? "PENDING"}</p>
          <p className="mt-0.5 text-[7px] text-neutral-400">Valid: {d.validityYear ?? "—"}</p>
        </div>
        <div className="rounded bg-white p-0.5 ring-1 ring-black/5">
          <QRCodeSVG
            value={JSON.stringify({ n: d.studentName, a: d.admissionNo, c: `${d.className}-${d.section}`, s: d.udise, id: d.cardNo ?? "" })}
            size={46}
            level="M"
            fgColor="#1f6f43"
          />
        </div>
      </div>
    </div>
  );
}

export function IDCardBack({ d }: { d: IDCardData }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-white font-sans shadow-xl ring-1 ring-black/5"
      style={{ width: CARD_W, height: CARD_H }}
    >
      {/* Top strip */}
      <div className="h-3 w-full" style={{ background: "linear-gradient(90deg, #1f6f43, #6cbf59)" }} />
      {/* Magnetic stripe placeholder */}
      <div className="mt-3 h-7 w-full bg-neutral-800" />

      <div className="px-4 pt-4">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-[#1f6f43]" />
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">School Address</p>
            <p className="mt-0.5 text-[8.5px] leading-snug text-neutral-700">{d.schoolAddress}</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5 rounded-md bg-neutral-50 p-1.5">
            <Phone className="h-3 w-3 shrink-0 text-[#1f6f43]" />
            <div>
              <p className="text-[7px] uppercase text-neutral-400">Phone</p>
              <p className="text-[8px] font-semibold text-neutral-700">{d.schoolPhone}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-neutral-50 p-1.5">
            <ShieldCheck className="h-3 w-3 shrink-0 text-[#1f6f43]" />
            <div>
              <p className="text-[7px] uppercase text-neutral-400">UDISE</p>
              <p className="font-mono text-[8px] font-semibold text-neutral-700">{d.udise}</p>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2">
          <p className="flex items-center gap-1 text-[8px] font-bold text-amber-800">
            <AlertCircle className="h-3 w-3" />Emergency Contact
          </p>
          <p className="mt-0.5 text-[8.5px] text-amber-900">
            {d.fatherName} · <span className="font-mono font-semibold">{d.emergencyContact ?? "—"}</span>
          </p>
        </div>

        <div className="mt-3 space-y-1 text-[8px]">
          <Row k="Mother" v={d.motherName} />
          <Row k="Medium" v={d.medium} />
          <Row k="Issued" v={d.issuedAt ? fmtDate(d.issuedAt, "en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"} />
          <Row k="Valid Till" v={d.validityYear ?? "—"} />
        </div>

        {/* If found, return to school */}
        <div className="mt-3 rounded-md border border-dashed border-neutral-300 p-2 text-center">
          <p className="text-[7.5px] font-semibold uppercase tracking-wider text-neutral-500">If found, please return to</p>
          <p className="text-[8px] font-bold text-neutral-700">{d.schoolName}</p>
          <p className="text-[7.5px] text-neutral-500">{d.schoolPhone}</p>
        </div>

        {/* Signature line */}
        <div className="mt-4 flex items-end justify-between">
          <div className="text-center">
            <div className="h-6 w-20 border-b border-neutral-400" />
            <p className="mt-0.5 text-[7px] uppercase text-neutral-400">Headmaster</p>
          </div>
          <div className="text-right">
            <p className="text-[7px] text-neutral-400">This is an internal school ID card.</p>
            <p className="text-[7px] text-neutral-400">Not a government identity document.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value, full, highlight }: { label: string; value: string; full?: boolean; highlight?: boolean }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <p className="text-[7px] uppercase tracking-wider text-neutral-400">{label}</p>
      <p className={`text-[9px] font-semibold ${highlight ? "text-[#c2410c]" : "text-neutral-700"}`}>{value}</p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-neutral-100 py-0.5">
      <span className="text-neutral-400">{k}</span>
      <span className="font-medium text-neutral-700">{v}</span>
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
