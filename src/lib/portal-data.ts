import { db } from "@/lib/db";

// ─── HM / Admin ────────────────────────────────────────────────────────
export async function getHmData(schoolId: string) {
  const [students, staff, idRequests, schemes, notices, auditLogs, attendanceToday, exams, school, handover, onboardings] = await Promise.all([
    db.student.findMany({
      where: { schoolId, status: "ACTIVE" },
      include: { enrolments: { orderBy: { academicYear: "desc" }, take: 1 } },
      orderBy: { admissionNo: "asc" },
    }),
    db.staff.findMany({ where: { schoolId }, include: { assignments: true, user: { select: { id: true, email: true, role: true, active: true } } }, orderBy: { designation: "asc" } }),
    db.iDCardRequest.findMany({
      where: { schoolId },
      include: {
        student: { include: { enrolments: { orderBy: { academicYear: "desc" }, take: 1 } } },
        requestedBy: { select: { name: true } },
        approvedBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.schemeApplication.findMany({
      where: { schoolId },
      include: { student: true, operator: { select: { name: true } } },
      orderBy: { appliedAt: "desc" },
    }),
    db.notice.findMany({ where: { schoolId }, orderBy: { createdAt: "desc" } }),
    db.auditLog.findMany({ where: { schoolId }, include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 20 }),
    db.attendance.findMany({ where: { student: { schoolId } } }),
    db.exam.findMany({ where: { schoolId }, include: { _count: { select: { marks: true, hallTickets: true } } } }),
    db.school.findUnique({ where: { id: schoolId } }),
    db.hMHandover.findFirst({ where: { schoolId }, include: { authorizedUser: { select: { id: true, name: true, email: true, role: true } }, fromHM: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
    db.staffOnboarding.findMany({ where: { schoolId }, orderBy: { invitedAt: "desc" } }),
  ]);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const presentToday = attendanceToday.filter((a) => a.status === "PRESENT").length;
  const totalToday = attendanceToday.length;
  const attendanceRate = totalToday > 0 ? Math.round((presentToday / totalToday) * 100) : 0;

  return {
    schoolId,
    school,
    students,
    staff,
    idRequests,
    schemes,
    notices,
    auditLogs,
    exams,
    handover,
    onboardings,
    attendance: attendanceToday,
    stats: {
      totalStudents: students.length,
      totalStaff: staff.length,
      attendanceRate,
      pendingIdApprovals: idRequests.filter((r) => r.status === "SUBMITTED").length,
      pendingSchemeVerify: schemes.filter((s) => s.status === "SUBMITTED" || s.status === "DRAFT").length,
      totalNotices: notices.length,
      publishedNotices: notices.filter((n) => n.status === "PUBLISHED").length,
    },
  };
}
export type HmData = Awaited<ReturnType<typeof getHmData>>;

// ─── Teacher ───────────────────────────────────────────────────────────
export async function getTeacherData(schoolId: string, staffId: string) {
  const staff = await db.staff.findUnique({
    where: { id: staffId },
    include: { assignments: true },
  });
  const assignments = staff?.assignments ?? [];
  // Teach class X-A by default for demo (first assignment)
  const primaryClass = assignments[0];
  const className = primaryClass?.className ?? "X";
  const section = primaryClass?.section ?? "A";

  const [students, homework, timetable, exams, attendance, handover] = await Promise.all([
    db.student.findMany({
      where: { schoolId, status: "ACTIVE", enrolments: { some: { className, section, status: "ENROLLED" } } },
      include: { enrolments: { where: { className, section }, take: 1 } },
      orderBy: { rollNo: "asc" },
    }),
    db.homework.findMany({ where: { schoolId, className, section }, include: { _count: { select: { submissions: true } } }, orderBy: { createdAt: "desc" } }),
    db.timetable.findMany({ where: { schoolId, className, section }, orderBy: [{ day: "asc" }, { period: "asc" }] }),
    db.exam.findMany({ where: { schoolId, className }, include: { marks: { where: { studentId: { in: [] } } } } }),
    db.attendance.findMany({ where: { className, section, student: { schoolId } } }),
    db.hMHandover.findFirst({ where: { schoolId }, include: { authorizedUser: { select: { id: true, name: true, email: true, role: true } }, fromHM: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
  ]);

  return { staff, assignments, className, section, students, homework, timetable, exams, attendance, handover };
}
export type TeacherData = Awaited<ReturnType<typeof getTeacherData>>;

// ─── Student ───────────────────────────────────────────────────────────
export async function getStudentData(studentId: string) {
  const student = await db.student.findUnique({
    where: { id: studentId },
    include: {
      school: true,
      enrolments: { orderBy: { academicYear: "desc" } },
      guardians: { include: { guardian: true } },
      attendance: { orderBy: { date: "desc" }, take: 30 },
      marks: { include: { exam: true } },
      homeworkSubs: { include: { homework: true }, orderBy: { homework: { createdAt: "desc" } } },
      idCards: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!student) return null;
  const enrolment = student.enrolments[0];
  const homework = await db.homework.findMany({
    where: { schoolId: student.schoolId, className: enrolment?.className ?? "X", section: enrolment?.section ?? "A" },
    orderBy: { createdAt: "desc" },
  });
  const timetable = await db.timetable.findMany({
    where: { schoolId: student.schoolId, className: enrolment?.className ?? "X", section: enrolment?.section ?? "A" },
    orderBy: [{ day: "asc" }, { period: "asc" }],
  });
  const notices = await db.notice.findMany({ where: { schoolId: student.schoolId, status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, take: 6 });
  return { student, enrolment, homework, timetable, notices };
}
export type StudentData = Awaited<ReturnType<typeof getStudentData>>;

// ─── Parent (linked child) ─────────────────────────────────────────────
export async function getParentData(studentId: string) {
  // Parent sees the same child dashboard as student (read-only).
  return getStudentData(studentId);
}

// ─── Scheme operator ───────────────────────────────────────────────────
export async function getSchemeData(schoolId: string) {
  const [schemes, vaultEntries, accessLogs] = await Promise.all([
    db.schemeApplication.findMany({
      where: { schoolId },
      include: { student: true, operator: { select: { name: true } } },
      orderBy: { appliedAt: "desc" },
    }),
    db.restrictedVault.findMany({ where: { student: { schoolId } }, include: { student: { select: { name: true, admissionNo: true } } } }),
    db.vaultAccessLog.findMany({ orderBy: { accessedAt: "desc" }, take: 20, include: { vault: { include: { student: { select: { name: true } } } } } }),
  ]);
  return { schemes, vaultEntries, accessLogs };
}
export type SchemeData = Awaited<ReturnType<typeof getSchemeData>>;

// ─── ID card operator ──────────────────────────────────────────────────
export async function getIdOperatorData(schoolId: string, operatorId: string) {
  const [requests, students, school, handover] = await Promise.all([
    db.iDCardRequest.findMany({
      where: { schoolId },
      include: {
        student: { include: { enrolments: { take: 1, orderBy: { academicYear: "desc" } } } },
        requestedBy: { select: { name: true } },
        approvedBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.student.findMany({ where: { schoolId, status: "ACTIVE" }, include: { enrolments: { take: 1, orderBy: { academicYear: "desc" } } }, orderBy: { admissionNo: "asc" } }),
    db.school.findUnique({ where: { id: schoolId } }),
    db.hMHandover.findFirst({ where: { schoolId }, include: { authorizedUser: { select: { id: true, name: true, email: true, role: true } }, fromHM: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
  ]);
  return { requests, students, school, operatorId, handover };
}
export type IdOperatorData = Awaited<ReturnType<typeof getIdOperatorData>>;

// ─── Command centers (aggregated) ──────────────────────────────────────
export async function getCommandData(role: string, schoolId?: string) {
  // For demo: scope to the single school but aggregate as if multi-level.
  const schools = await db.school.findMany({ select: { id: true, name: true, nameTe: true, mandal: true, district: true, udise: true } });
  const targetSchoolId = schoolId ?? schools[0]?.id;
  if (!targetSchoolId) return null;

  const [students, staff, attendance, exams, schemes, idCards] = await Promise.all([
    db.student.findMany({ where: { schoolId: targetSchoolId, status: "ACTIVE" }, select: { id: true, gender: true, category: true, enrolments: true } }),
    db.staff.findMany({ where: { schoolId: targetSchoolId }, select: { id: true, designation: true, status: true } }),
    db.attendance.findMany({ where: { student: { schoolId: targetSchoolId } }, select: { status: true } }),
    db.exam.findMany({ where: { schoolId: targetSchoolId }, include: { marks: true } }),
    db.schemeApplication.findMany({ where: { schoolId: targetSchoolId }, select: { status: true, schemeName: true } }),
    db.iDCardRequest.findMany({ where: { schoolId: targetSchoolId }, select: { status: true } }),
  ]);

  const present = attendance.filter((a) => a.status === "PRESENT").length;
  const attendanceRate = attendance.length > 0 ? Math.round((present / attendance.length) * 100) : 0;

  // gender distribution
  const genderDist = {
    male: students.filter((s) => s.gender === "M").length,
    female: students.filter((s) => s.gender === "F").length,
  };
  // category distribution
  const catMap: Record<string, number> = {};
  students.forEach((s) => { const c = s.category ?? "OTHER"; catMap[c] = (catMap[c] ?? 0) + 1; });

  // class distribution
  const classMap: Record<string, number> = {};
  students.forEach((s) => { const c = s.enrolments[0]?.className ?? "?"; classMap[c] = (classMap[c] ?? 0) + 1; });

  // avg marks
  const allMarks = exams.flatMap((e) => e.marks.map((m) => m.marks / m.maxMarks));
  const avgScore = allMarks.length > 0 ? Math.round((allMarks.reduce((a, b) => a + b, 0) / allMarks.length) * 100) : 0;

  return {
    role,
    schools,
    targetSchoolId,
    stats: {
      totalStudents: students.length,
      totalStaff: staff.length,
      activeStaff: staff.filter((s) => s.status === "ACTIVE").length,
      attendanceRate,
      avgScore,
      schemesApproved: schemes.filter((s) => s.status === "APPROVED").length,
      idCardsIssued: idCards.filter((i) => i.status === "ISSUED").length,
    },
    genderDist,
    catMap,
    classMap,
    schemeSummary: schemes.reduce((acc, s) => {
      const k = s.schemeName;
      if (!acc[k]) acc[k] = { total: 0, approved: 0 };
      acc[k].total++;
      if (s.status === "APPROVED") acc[k].approved++;
      return acc;
    }, {} as Record<string, { total: number; approved: number }>),
  };
}
export type CommandData = Awaited<ReturnType<typeof getCommandData>>;
