import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// ID Card Operator marks an APPROVED card as PRINTED (then ISSUED).
// Internal school ID cards only — never official SSC/DGE.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "ID_OPERATOR")
    return NextResponse.json({ error: "Only ID Card Operator may print" }, { status: 403 });

  const { id } = await params;
  const req = await db.iDCardRequest.findUnique({ where: { id } });
  if (!req) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let nextStatus: string;
  if (req.status === "APPROVED") nextStatus = "PRINTED";
  else if (req.status === "PRINTED") nextStatus = "ISSUED";
  else return NextResponse.json({ error: `Cannot advance from ${req.status}` }, { status: 400 });

  const updated = await db.iDCardRequest.update({
    where: { id },
    data: {
      status: nextStatus,
      printedAt: nextStatus === "PRINTED" ? new Date() : req.printedAt,
      issuedAt: nextStatus === "ISSUED" ? new Date() : req.issuedAt,
    },
  });

  await db.auditLog.create({
    data: {
      schoolId: req.schoolId,
      userId: (session.user as any).id,
      action: `ID_CARD_${nextStatus}`,
      entity: "IDCardRequest",
      entityId: id,
      details: `Marked ID card as ${nextStatus}`,
    },
  });

  return NextResponse.json({ ok: true, request: updated });
}
