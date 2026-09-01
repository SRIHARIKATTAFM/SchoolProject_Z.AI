import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// HM approves an ID card request. (Operator cannot approve — enforced by role.)
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "HM") return NextResponse.json({ error: "Only Headmaster can approve ID cards" }, { status: 403 });

  const { id } = await params;
  const req = await db.iDCardRequest.findUnique({ where: { id } });
  if (!req) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (req.status !== "SUBMITTED") return NextResponse.json({ error: "Request is not in SUBMITTED state" }, { status: 400 });

  const updated = await db.iDCardRequest.update({
    where: { id },
    data: {
      status: "APPROVED",
      approvedById: (session.user as any).id,
      approvedAt: new Date(),
    },
  });

  await db.auditLog.create({
    data: {
      schoolId: req.schoolId,
      userId: (session.user as any).id,
      action: "ID_CARD_APPROVE",
      entity: "IDCardRequest",
      entityId: id,
      details: `Approved ID card for student ${req.studentId}`,
    },
  });

  return NextResponse.json({ ok: true, request: updated });
}
