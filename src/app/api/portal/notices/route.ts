import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// HM publishes a notice (CMS workflow).
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "HM")
    return NextResponse.json({ error: "Only Headmaster can publish notices" }, { status: 403 });

  const body = await req.json();
  const { title, titleTe, content, contentTe, category, schoolId } = body;
  if (!title || !content || !schoolId)
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  const notice = await db.notice.create({
    data: {
      schoolId,
      title,
      titleTe: titleTe || null,
      content,
      contentTe: contentTe || null,
      category: category || "GENERAL",
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  await db.auditLog.create({
    data: {
      schoolId,
      userId: (session.user as any).id,
      action: "NOTICE_PUBLISH",
      entity: "Notice",
      entityId: notice.id,
      details: `Published notice: ${title}`,
    },
  });

  return NextResponse.json({ ok: true, notice });
}
