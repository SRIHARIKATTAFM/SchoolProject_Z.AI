import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// HM (or authorized office staff) onboards a new staff member / creates a role.
// Creates a StaffOnboarding record (PENDING) + the Staff + User accounts immediately
// so the new staff member can log in.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  const schoolId = (session.user as any).schoolId;
  if (!schoolId) return NextResponse.json({ error: "No school context" }, { status: 400 });

  // HM can always onboard. Other office staff (ID_OPERATOR) can onboard non-HM roles.
  const body = await req.json();
  const { name, email, designation, subject, phone, qualification, role: newRole, password } = body;

  if (!name || !email || !designation || !newRole || !password)
    return NextResponse.json({ error: "name, email, designation, role, password are required" }, { status: 400 });

  if (!["HM", "TEACHER", "SCHEME_OPERATOR", "ID_OPERATOR"].includes(newRole))
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });

  // Non-HM staff cannot create HM accounts (only via handover flow).
  if (newRole === "HM" && role !== "HM")
    return NextResponse.json({ error: "Only the current Headmaster may onboard a new HM (via handover)" }, { status: 403 });

  // If onboarding an HM, check there's an active handover authorization for this user.
  if (newRole === "HM") {
    const handover = await db.hMHandover.findFirst({
      where: { schoolId, status: "ACTIVE", authorizedUserId: (session.user as any).id },
    });
    if (!handover)
      return NextResponse.json({ error: "No active handover authorization. The current HM must authorize you first." }, { status: 403 });
  }

  const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 });

  const hashedPw = bcrypt.hashSync(password, 10);

  // Create Staff record
  const staff = await db.staff.create({
    data: {
      schoolId,
      employeeId: `EMP-${Date.now().toString().slice(-6)}`,
      name,
      designation,
      subject: subject || null,
      phone: phone || null,
      email: email.toLowerCase(),
      qualification: qualification || null,
      joiningDate: new Date(),
      status: "ACTIVE",
    },
  });

  // Create User login
  const user = await db.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPw,
      name,
      role: newRole,
      schoolId,
      staffId: staff.id,
      active: true,
    },
  });

  // Link staff → user
  await db.staff.update({ where: { id: staff.id }, data: { user: { connect: { id: user.id } } } });

  // Record the onboarding
  await db.staffOnboarding.create({
    data: {
      schoolId,
      name,
      email: email.toLowerCase(),
      designation,
      subject: subject || null,
      phone: phone || null,
      qualification: qualification || null,
      role: newRole,
      status: "COMPLETED",
      password: hashedPw,
      onboardedById: (session.user as any).id,
      staffId: staff.id,
      completedAt: new Date(),
    },
  });

  // If this was an HM onboarding via handover, consume the handover authorization.
  if (newRole === "HM") {
    await db.hMHandover.updateMany({
      where: { schoolId, status: "ACTIVE" },
      data: { status: "CONSUMED", consumedAt: new Date() },
    });
  }

  await db.auditLog.create({
    data: {
      schoolId,
      userId: (session.user as any).id,
      action: "STAFF_ONBOARD",
      entity: "Staff",
      entityId: staff.id,
      details: `Onboarded ${name} as ${designation} (${newRole})`,
    },
  });

  return NextResponse.json({ ok: true, staff, user: { id: user.id, email: user.email, role: user.role } });
}
