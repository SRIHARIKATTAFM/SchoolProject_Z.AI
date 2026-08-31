import { db } from "@/lib/db";

// Server-side data fetchers for the public website.
// Fetches the first configured school (single-tenant reference implementation).
// All other queries are scoped to that school so the page never shows "not configured"
// when a UDISE changes during re-seeding.
export async function getPublicData() {
  const school = await db.school.findFirst({ orderBy: { createdAt: "asc" } });
  if (!school) {
    return { school: null, notices: [], events: [], achievements: [], staff: [], sscPapers: [], studentCount: 0 };
  }
  const [notices, events, achievements, staff, sscPapers, studentCount] = await Promise.all([
    db.notice.findMany({
      where: { schoolId: school.id, status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 8,
    }),
    db.event.findMany({ where: { schoolId: school.id }, orderBy: { date: "asc" }, take: 6 }),
    db.achievement.findMany({ where: { schoolId: school.id }, orderBy: { date: "desc" }, take: 8 }),
    db.staff.findMany({ where: { schoolId: school.id, status: { in: ["ACTIVE", "ON_LEAVE"] } }, orderBy: { designation: "asc" } }),
    db.sSCPaper.findMany({ orderBy: [{ year: "desc" }, { subject: "asc" }] }),
    db.student.count({ where: { schoolId: school.id, status: "ACTIVE" } }),
  ]);

  return { school, notices, events, achievements, staff, sscPapers, studentCount };
}

export type PublicData = Awaited<ReturnType<typeof getPublicData>>;
