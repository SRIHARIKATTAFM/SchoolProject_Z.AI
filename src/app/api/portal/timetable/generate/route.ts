import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// HM auto-generates a timetable for a class+section based on available staff + subjects.
// Simple algorithm: assign subjects to periods across MON–SAT, avoiding conflicts.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  const schoolId = (session.user as any).schoolId;
  if (!schoolId) return NextResponse.json({ error: "No school context" }, { status: 400 });
  if (role !== "HM" && role !== "TEACHER")
    return NextResponse.json({ error: "Only HM or Teacher may generate timetables" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { className, section } = body;
  if (!className || !section)
    return NextResponse.json({ error: "className and section are required" }, { status: 400 });

  // Delete existing timetable for this class+section.
  await db.timetable.deleteMany({ where: { schoolId, className, section } });

  // Get available staff with their subjects.
  const staff = await db.staff.findMany({
    where: { schoolId, status: "ACTIVE" },
    include: { assignments: true },
  });

  const SUBJECTS = ["Telugu", "English", "Mathematics", "Physical Science", "Biological Science", "Social Studies", "Hindi"];
  const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const PERIODS = [
    { p: 1, s: "09:30", e: "10:15" },
    { p: 2, s: "10:15", e: "11:00" },
    { p: 3, s: "11:15", e: "12:00" },
    { p: 4, s: "12:00", e: "12:45" },
    { p: 5, s: "13:45", e: "14:30" },
    { p: 6, s: "14:30", e: "15:15" },
    { p: 7, s: "15:15", e: "16:00" },
  ];

  // Build a pool of (subject, staffId) pairs from staff assignments.
  const pool: { subject: string; staffId: string }[] = [];
  staff.forEach((s) => {
    if (s.subject && SUBJECTS.includes(s.subject)) {
      pool.push({ subject: s.subject, staffId: s.id });
    }
  });
  // Fallback: if pool is small, repeat subjects without specific staff.
  while (pool.length < SUBJECTS.length * 2) {
    SUBJECTS.forEach((subj) => {
      const anyStaff = staff.find((s) => s.subject === subj) ?? staff[0];
      if (anyStaff) pool.push({ subject: subj, staffId: anyStaff.id });
    });
  }

  const created: any[] = [];
  let poolIdx = 0;
  for (const day of DAYS) {
    for (const per of PERIODS) {
      // Rotate through the subject pool so each subject appears regularly.
      const slot = pool[poolIdx % pool.length];
      poolIdx++;
      // Skip the last period on Saturday (half-day) — leave as games/library.
      if (day === "SAT" && per.p === 7) {
        created.push({ day, period: per.p, subject: "Games", startTime: per.s, endTime: per.e });
        continue;
      }
      created.push({
        day, period: per.p, subject: slot.subject, staffId: slot.staffId,
        startTime: per.s, endTime: per.e,
      });
    }
  }

  // Bulk create.
  for (const c of created) {
    await db.timetable.create({
      data: {
        schoolId,
        className,
        section,
        day: c.day,
        period: c.period,
        subject: c.subject,
        staffId: c.staffId ?? null,
        startTime: c.startTime,
        endTime: c.endTime,
      },
    });
  }

  await db.auditLog.create({
    data: {
      schoolId,
      userId: (session.user as any).id,
      action: "TIMETABLE_GENERATE",
      entity: "Timetable",
      details: `Generated timetable for ${className}-${section}`,
    },
  });

  return NextResponse.json({ ok: true, count: created.length });
}
