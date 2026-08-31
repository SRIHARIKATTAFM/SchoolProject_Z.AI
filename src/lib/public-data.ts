import { db } from "@/lib/db";

// Server-side data fetchers for the public website.
export async function getPublicData() {
  const [school, notices, events, achievements, staff, sscPapers, studentCount] = await Promise.all([
    db.school.findFirst({ where: { udise: "28141200754" } }),
    db.notice.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 8,
    }),
    db.event.findMany({ orderBy: { date: "asc" }, take: 6 }),
    db.achievement.findMany({ orderBy: { date: "desc" }, take: 8 }),
    db.staff.findMany({ where: { status: { in: ["ACTIVE", "ON_LEAVE"] } }, orderBy: { designation: "asc" } }),
    db.sSCPaper.findMany({ orderBy: [{ year: "desc" }, { subject: "asc" }] }),
    db.student.count({ where: { status: "ACTIVE" } }),
  ]);

  return { school, notices, events, achievements, staff, sscPapers, studentCount };
}

export type PublicData = Awaited<ReturnType<typeof getPublicData>>;
