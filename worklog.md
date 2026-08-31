# AP School Digital Platform — Worklog

Project: ZPHS Kunaparajuparva reference implementation on Next.js 16 + Prisma/SQLite + NextAuth.
This file is the single shared worklog. All agents append below using the `---` separator.

---
Task ID: 0
Agent: main (orchestrator)
Task: Bootstrap — inspect environment, lock architecture, define schema.

Work Log:
- Inspected project: Next.js 16, Prisma/SQLite, NextAuth v4, next-themes, recharts, zustand, full shadcn/ui set. Dev server on :3000.
- Confirmed cannot access external GitHub repo (no outbound git/internet). Building a faithful reference implementation of the frozen blueprint on the sandbox stack.
- Locked decisions: bilingual EN/TE public site at `/`; role-scoped portals under `/portal/*`; sensitive data behind vault/reference model with audited reveals; internal-only hall tickets (never official SSC/DGE); ID-card operator-submits / HM-approves separation; aggregation upward (no PII at higher levels).

Stage Summary:
- Architecture locked. Proceeding to schema → seed → auth → i18n → public site → portals → verify.

---
Task ID: 1-9
Agent: main (orchestrator)
Task: Build full reference implementation — schema, seed, auth, i18n, public site, login, all portals, API routes.

Work Log:
- Schema (prisma/schema.prisma): School, User(role), Staff+StaffAssignment+StaffAttendance, Student+Enrolment+Guardian+StudentGuardian, Attendance, Timetable, Exam+Mark+HallTicket(INTERNAL only), Homework+Submission, IDCardRequest(operator-submits/HM-approves), SchemeApplication, RestrictedVault(AADHAAR/BANK, encrypted)+VaultAccessLog, Notice/Event/Achievement (CMS), SSCPaper(central library, nullable schoolId), AuditLog. Pushed to SQLite.
- Seed (prisma/seed.ts): ZPHS Kunaparajuparva (UDISE 28141200754), 8 staff, 30 students VI–X, guardians, 30 days attendance, class-X timetable, FA1 exam+marks+internal hall tickets, homework, 5 ID-card requests (mixed statuses), 30 scheme apps + 20 vault entries (masked/encrypted), 5 notices, 3 events, 4 achievements, 140 SSC papers (7yr×5subj×4types), 11 demo users (all password demo123).
- Auth: NextAuth v4 credentials provider, JWT session with role+schoolId+staffId+studentId; middleware (withAuth) protects /portal/*; /portal redirects by role.
- i18n: EN/TE dictionary + I18nProvider (cookie + <html lang> toggle); Noto Sans Telugu font applied via html[lang=te]; green education theme.
- Public site '/': hero(AI campus images), about, academics VI–X, staff grid, facilities, notices+events, achievements, SSC library (filterable: year/subject/medium/type, 140 papers), transparency, contact, sticky footer with internal-hall-ticket disclaimer.
- Login '/login': form + 8 quick-pick demo accounts.
- Portals (role-scoped, each shows ONLY its functions via PortalScaffold sidebar):
  • HM: dashboard, students, staff, attendance, academics, exams(internal hall tickets + disclaimer), ID-card approve/reject (audited), schemes, notices/CMS publish (audited), reports, audit log.
  • Teacher: my classes, attendance, marks, homework/LMS, timetable, announcements.
  • Student: today(greeting), homework, timetable, attendance, results(progress bars), announcements, school ID, profile+guardians.
  • Parent: child dashboard, homework, attendance, results, timetable, announcements, school ID.
  • Scheme Operator: scheme cases, restricted vault (masked refs + audited reveal dialog requiring reason), reveal history.
  • ID Card Operator: student search, print queue (APPROVED→PRINTED→ISSUED), issued cards; separation-of-duties banner.
  • Command (MEO/DEO/STATE/MINISTER): aggregated KPIs + recharts (class enrolment bar, gender pie, category pie, scheme stacked bar) + minister district comparison; no PII banner.
- API routes: POST /api/portal/id-card/[id]/approve|reject|print, POST /api/portal/vault/[id]/reveal (audited), POST /api/portal/notices (publish). All role-checked; audit logs written.

Stage Summary:
- Lint clean. Dev server healthy on :3000.
- Agent-browser verified: public site renders all sections; EN/TE toggle works; HM login→dashboard with 11 sections; ID-card approval decrements pending count + toast; scheme vault reveal requires reason + writes REVEAL_VALUE audit entry (confirmed in Audit Log); command center renders charts for Minister; student portal shows personalized greeting + 8 sections; mobile (390px) responsive; no console/runtime errors.
- All blueprint rules honored: bilingual, role-scoped portals, Aadhaar/bank behind audited vault, internal-only hall tickets (disclaimer in footer+exams section), ID-card operator-submits/HM-approves separation, aggregation upward with no PII at command level.
