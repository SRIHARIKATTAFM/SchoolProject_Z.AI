import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Change a student's section (e.g. A → B, B → C).
// Allowed by: HM, ID_OPERATOR (office staff), TEACHER (class teacher).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (!["HM", "ID_OPERATOR", "TEACHER"].includes(role))
    return NextResponse.json({ error: "Only school staff may change sections" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { section, academicYear } = body;
  if (!section || !["A", "B", "C"].includes(section))
    return NextResponse.json({ error: "Valid section (A/B/C) required" }, { status: 400 });

  const student = await db.student.findUnique({ where: { id }, include: { enrolments: { orderBy: { academicYear: "desc" }, take: 1 } } });
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  const enrolment = student.enrolments[0];
  if (!enrolment) return NextResponse.json({ error: "No active enrolment found" }, { status: 404 });
  if (enrolment.section === section)
    return NextResponse.json({ error: `Student is already in section ${section}` }, { status: 400 });

  // Update the latest enrolment's section.
  const updated = await db.enrolment.update({
    where: { id: enrolment.id },
    data: { section },
  });

  await db.auditLog.create({
    data: {
      schoolId: student.schoolId,
      userId: (session.user as any).id,
      action: "STUDENT_SECTION_CHANGE",
      entity: "Student",
      entityId: id,
      details: `Changed ${student.name} from ${enrolment.section} to ${section} (${enrolment.className})`,
    },
  });

  return NextResponse.json({ ok: true, enrolment: updated });
}
