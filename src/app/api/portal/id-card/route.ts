import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// ID Card Operator creates a new ID card request for a student.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "ID_OPERATOR")
    return NextResponse.json({ error: "Only ID Card Operator may create ID requests" }, { status: 403 });

  const body = await req.json();
  const { studentId, schoolId, cardType } = body;
  if (!studentId || !schoolId)
    return NextResponse.json({ error: "studentId and schoolId are required" }, { status: 400 });

  const student = await db.student.findUnique({ where: { id: studentId } });
  if (!student || student.schoolId !== schoolId)
    return NextResponse.json({ error: "Student not found in this school" }, { status: 404 });

  const request = await db.iDCardRequest.create({
    data: {
      schoolId,
      studentId,
      requestedById: (session.user as any).id,
      status: "SUBMITTED",
      cardType: cardType ?? "NEW",
      validityYear: "2024-25",
      submittedAt: new Date(),
    },
  });

  await db.auditLog.create({
    data: {
      schoolId,
      userId: (session.user as any).id,
      action: "ID_CARD_REQUEST_CREATE",
      entity: "IDCardRequest",
      entityId: request.id,
      details: `Created ${cardType ?? "NEW"} ID card request for student ${student.name}`,
    },
  });

  return NextResponse.json({ ok: true, request });
}
