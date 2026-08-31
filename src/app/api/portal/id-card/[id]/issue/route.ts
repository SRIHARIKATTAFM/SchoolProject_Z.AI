import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Issue or reprint an ID card at the school counter.
// - Issue: assigns a sequential card number ZPHS-KUN-{yy}-{nnn}, snapshots the
//   student's SID, records the issuer + academic year + valid-till date.
// - Reprint: re-stamps issuedAt on an already-issued card.
//
// Both HM and ID_CARD_OPERATOR (office staff) may use this counter desk.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "HM" && role !== "ID_OPERATOR")
    return NextResponse.json({ error: "Only school counter staff (HM / ID Operator) may issue cards" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const action = String(body.action ?? "issue"); // "issue" | "reprint"

  const existing = await db.iDCardRequest.findUnique({
    where: { id },
    include: { student: { select: { sid: true, name: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "issue") {
    if (existing.status === "ISSUED")
      return NextResponse.json({ error: "Card is already issued. Use reprint instead." }, { status: 400 });
    if (!existing.photoUrl)
      return NextResponse.json({ error: "Cannot issue a card without a photo" }, { status: 400 });

    // Card number: ZPHS-KUN-{yy}-{nnn}  (yy = 2-digit year, nnn = 3-digit sequence)
    const now = new Date();
    const yy = String(now.getFullYear()).slice(2);
    const prefix = `ZPHS-KUN-${yy}-`;
    const lastCard = await db.iDCardRequest.findFirst({
      where: { cardNo: { startsWith: prefix } },
      orderBy: { cardNo: "desc" },
    });
    const nextSeq = lastCard?.cardNo ? parseInt(lastCard.cardNo.slice(prefix.length), 10) + 1 : 1;
    const cardNo = `${prefix}${String(nextSeq).padStart(3, "0")}`;

    // Academic year + valid-till (31 Mar of the year after the start year)
    const startYear = now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
    const validityYear = `${startYear}-${String(startYear + 1).slice(2)}`;
    const validTill = `31 Mar ${startYear + 1}`;

    const updated = await db.iDCardRequest.update({
      where: { id },
      data: {
        status: "ISSUED",
        cardNo,
        sidSnapshot: existing.student.sid ?? null,
        validityYear,
        validTill,
        approvedById: existing.approvedById ?? (session.user as any).id,
        approvedAt: existing.approvedAt ?? now,
        printedAt: existing.printedAt ?? now,
        issuedAt: now,
      },
    });

    await db.auditLog.create({
      data: {
        schoolId: existing.schoolId,
        userId: (session.user as any).id,
        action: "ID_CARD_ISSUE",
        entity: "IDCardRequest",
        entityId: id,
        details: `Issued ID card ${cardNo} (SID ${existing.student.sid ?? "—"}) for ${existing.student.name}`,
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
