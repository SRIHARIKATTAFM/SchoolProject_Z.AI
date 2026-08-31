import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// An authorized user (designated by the leaving HM) onboards the new Headmaster.
// This consumes the handover authorization (auto-disables).
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const schoolId = (session.user as any).schoolId;
  const userId = (session.user as any).id;
  if (!schoolId) return NextResponse.json({ error: "No school context" }, { status: 400 });

  // Check there's an ACTIVE handover authorization for THIS user.
  const handover = await db.hMHandover.findFirst({
    where: { schoolId, status: "ACTIVE", authorizedUserId: userId },
  });
  if (!handover)
    return NextResponse.json({ error: "You are not authorized to onboard a new Headmaster. The current HM must authorize you first." }, { status: 403 });

  const body = await req.json();
  const { name, email, phone, qualification, password } = body;
  if (!name || !email || !password)
    return NextResponse.json({ error: "name, email, password are required" }, { status: 400 });

  const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 });

  const hashedPw = bcrypt.hashSync(password, 10);

  // Create Staff record for the new HM
  const staff = await db.staff.create({
    data: {
      schoolId,
      employeeId: `EMP-${Date.now().toString().slice(-6)}`,
      name,
      designation: "Headmaster",
      subject: "Social Studies",
      phone: phone || null,
      email: email.toLowerCase(),
      qualification: qualification || null,
      joiningDate: new Date(),
      status: "ACTIVE",
    },
  });

  // Create User login with HM role
  const user = await db.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPw,
      name,
      role: "HM",
      schoolId,
      staffId: staff.id,
      active: true,
    },
  });

  await db.staff.update({ where: { id: staff.id }, data: { user: { connect: { id: user.id } } } });

  // Record the onboarding
  await db.staffOnboarding.create({
    data: {
      schoolId,
      name,
      email: email.toLowerCase(),
      designation: "Headmaster",
      role: "HM",
      status: "COMPLETED",
      password: hashedPw,
      onboardedById: userId,
      staffId: staff.id,
      completedAt: new Date(),
    },
  });

  // Consume the handover — auto-disable so the option can't be used again.
  await db.hMHandover.update({
    where: { id: handover.id },
    data: { status: "CONSUMED", consumedAt: new Date() },
  });

  await db.auditLog.create({
    data: {
      schoolId,
      userId,
      action: "HM_ONBOARD",
      entity: "Staff",
      entityId: staff.id,
      details: `Onboarded new Headmaster ${name} (${email}). Handover consumed.`,
    },
  });

  return NextResponse.json({ ok: true, staff, user: { id: user.id, email: user.email, role: user.role } });
}

// Check whether the current user is authorized to onboard a new HM.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const schoolId = (session.user as any).schoolId;
  const userId = (session.user as any).id;
  if (!schoolId) return NextResponse.json({ authorized: false });

  const handover = await db.hMHandover.findFirst({
    where: { schoolId, status: "ACTIVE", authorizedUserId: userId },
    include: { fromHM: { select: { name: true } } },
  });
  return NextResponse.json({ authorized: !!handover, handover });
}
