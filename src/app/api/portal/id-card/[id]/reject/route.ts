import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// HM rejects an ID card request with a reason.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "HM")
    return NextResponse.json({ error: "Only Headmaster can reject ID cards" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const reason = String(body.reason ?? "Not specified");

  const existing = await db.iDCardRequest.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.status !== "SUBMITTED")
    return NextResponse.json({ error: "Request is not in SUBMITTED state" }, { status: 400 });

  const updated = await db.iDCardRequest.update({
    where: { id },
    data: {
      status: "REJECTED",
      approvedById: (session.user as any).id,
      approvedAt: new Date(),
      rejectionReason: reason,
    },
  });

  await db.auditLog.create({
    data: {
      schoolId: existing.schoolId,
      userId: (session.user as any).id,
      action: "ID_CARD_REJECT",
      entity: "IDCardRequest",
      entityId: id,
      details: `Rejected: ${reason}`,
    },
  });

  return NextResponse.json({ ok: true, request: updated });
}
