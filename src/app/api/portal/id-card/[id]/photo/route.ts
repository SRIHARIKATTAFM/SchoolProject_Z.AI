import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// ID Card Operator attaches a cropped photo + crop metadata to a request (DRAFT or SUBMITTED).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "ID_OPERATOR")
    return NextResponse.json({ error: "Only ID Card Operator may attach photos" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { photoUrl, zoom, positionX, positionY } = body as {
    photoUrl: string; zoom: number; positionX: number; positionY: number;
  };
  if (!photoUrl || !photoUrl.startsWith("data:image/"))
    return NextResponse.json({ error: "A valid cropped photo (data URL) is required" }, { status: 400 });

  const existing = await db.iDCardRequest.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.status === "ISSUED")
    return NextResponse.json({ error: "Cannot edit an already-issued card" }, { status: 400 });

  const updated = await db.iDCardRequest.update({
    where: { id },
    data: {
      photoUrl,
      photoZoom: zoom,
      photoPositionX: positionX,
      photoPositionY: positionY,
    },
  });
  // Also persist the photo on the student record (so it carries to future cards).
  await db.student.update({ where: { id: existing.studentId }, data: { photoUrl } });

  await db.auditLog.create({
    data: {
      schoolId: existing.schoolId,
      userId: (session.user as any).id,
      action: "ID_CARD_PHOTO_ATTACH",
      entity: "IDCardRequest",
      entityId: id,
      details: `Attached photo for student ${existing.studentId}`,
    },
  });

  return NextResponse.json({ ok: true, request: updated });
}
