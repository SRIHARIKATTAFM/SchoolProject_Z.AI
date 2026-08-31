import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Deactivate (remove) a staff member — sets status to INACTIVE and user.active = false.
// HM only. Cannot deactivate yourself.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "HM")
    return NextResponse.json({ error: "Only Headmaster may remove staff" }, { status: 403 });

  const { id } = await params;
  const staff = await db.staff.findUnique({ where: { id }, include: { user: true } });
  if (!staff) return NextResponse.json({ error: "Staff not found" }, { status: 404 });

  if (staff.user?.id === (session.user as any).id)
    return NextResponse.json({ error: "You cannot remove your own account. Use the handover flow." }, { status: 400 });

  await db.staff.update({ where: { id }, data: { status: "RETIRED" } });
  if (staff.user) await db.user.update({ where: { id: staff.user.id }, data: { active: false } });

  await db.auditLog.create({
    data: {
      schoolId: staff.schoolId,
      userId: (session.user as any).id,
      action: "STAFF_REMOVE",
      entity: "Staff",
      entityId: id,
      details: `Removed staff ${staff.name} (${staff.designation})`,
    },
  });

  return NextResponse.json({ ok: true });
}
