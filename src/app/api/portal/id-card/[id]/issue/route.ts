import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// HM issues an approved ID card: assigns a serial card number and marks ISSUED.
// HM may also re-print/re-issue an already-ISSUED card (bumps a reprint counter is not stored —
// here we just re-issue with a fresh issuedAt timestamp).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "HM")
    return NextResponse.json({ error: "Only Headmaster may issue ID cards" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const action = String(body.action ?? "issue"); // "issue" | "reprint"

  const existing = await db.iDCardRequest.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "issue") {
    if (existing.status !== "APPROVED" && existing.status !== "PRINTED")
      return NextResponse.json({ error: "Card must be APPROVED or PRINTED before issuing" }, { status: 400 });
    if (!existing.photoUrl)
      return NextResponse.json({ error: "Cannot issue a card without a photo" }, { status: 400 });

    // Assign a serial card number (school-prefixed + year + sequence).
    const year = new Date().getFullYear();
    const prefix = `KNP-ID-${year}-`;
    const lastCard = await db.iDCardRequest.findFirst({
      where: { cardNo: { startsWith: prefix } },
      orderBy: { cardNo: "desc" },
    });
    const nextSeq = lastCard?.cardNo ? parseInt(lastCard.cardNo.slice(prefix.length), 10) + 1 : 1;
    const cardNo = `${prefix}${String(nextSeq).padStart(4, "0")}`;

    const updated = await db.iDCardRequest.update({
      where: { id },
      data: {
        status: "ISSUED",
        cardNo,
        validityYear: existing.validityYear ?? `${year}-${(year + 1).toString().slice(2)}`,
        approvedById: existing.approvedById ?? (session.user as any).id,
        approvedAt: existing.approvedAt ?? new Date(),
        printedAt: existing.printedAt ?? new Date(),
        issuedAt: new Date(),
      },
    });

    await db.auditLog.create({
      data: {
        schoolId: existing.schoolId,
        userId: (session.user as any).id,
        action: "ID_CARD_ISSUE",
        entity: "IDCardRequest",
        entityId: id,
        details: `Issued ID card ${cardNo} for student ${existing.studentId}`,
      },
    });

    return NextResponse.json({ ok: true, request: updated, cardNo });
  }

  if (action === "reprint") {
    if (existing.status !== "ISSUED")
      return NextResponse.json({ error: "Only issued cards can be reprinted" }, { status: 400 });
    const updated = await db.iDCardRequest.update({
      where: { id },
      data: { issuedAt: new Date() },
    });
    await db.auditLog.create({
      data: {
        schoolId: existing.schoolId,
        userId: (session.user as any).id,
        action: "ID_CARD_REPRINT",
        entity: "IDCardRequest",
        entityId: id,
        details: `Reprinted ID card ${existing.cardNo}`,
      },
    });
    return NextResponse.json({ ok: true, request: updated });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
