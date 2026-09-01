import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// The leaving HM authorizes someone (an existing staff user) to onboard the next HM.
// GET — check current handover status.
// POST — create/refresh the authorization.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const schoolId = (session.user as any).schoolId;
  if (!schoolId) return NextResponse.json({ error: "No school" }, { status: 400 });

  const handover = await db.hMHandover.findFirst({
    where: { schoolId },
    include: { authorizedUser: { select: { id: true, name: true, email: true, role: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ handover });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  const schoolId = (session.user as any).schoolId;
  const userId = (session.user as any).id;
  if (role !== "HM" || !schoolId)
    return NextResponse.json({ error: "Only the current Headmaster may authorize a handover" }, { status: 403 });

  const body = await req.json();
  const { authorizedUserId, note } = body;
  if (!authorizedUserId)
    return NextResponse.json({ error: "authorizedUserId is required" }, { status: 400 });

  // The authorized user must be an existing staff member in the same school.
  const target = await db.user.findUnique({ where: { id: authorizedUserId }, include: { staff: true } });
  if (!target || target.schoolId !== schoolId)
    return NextResponse.json({ error: "Authorized user must be a staff member in this school" }, { status: 404 });
  if (target.id === userId)
    return NextResponse.json({ error: "You cannot authorize yourself" }, { status: 400 });

  // Cancel any existing ACTIVE handover, then create a new one.
  await db.hMHandover.updateMany({ where: { schoolId, status: "ACTIVE" }, data: { status: "CANCELLED" } });
  const handover = await db.hMHandover.create({
    data: {
      schoolId,
      authorizedUserId,
      fromHMId: userId,
      status: "ACTIVE",
      note: note || null,
    },
  });

  await db.auditLog.create({
    data: {
      schoolId,
      userId,
      action: "HM_HANDOVER_AUTHORIZE",
      entity: "HMHandover",
      entityId: handover.id,
      details: `Authorized ${target.name} to onboard the next Headmaster`,
    },
  });

  return NextResponse.json({ ok: true, handover });
}

// Cancel an active handover.
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  const schoolId = (session.user as any).schoolId;
  if (role !== "HM" || !schoolId)
    return NextResponse.json({ error: "Only the current Headmaster may cancel a handover" }, { status: 403 });

  await db.hMHandover.updateMany({ where: { schoolId, status: "ACTIVE" }, data: { status: "CANCELLED" } });
  return NextResponse.json({ ok: true });
}
