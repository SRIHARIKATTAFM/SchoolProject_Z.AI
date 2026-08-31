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

---
Task ID: 10
Agent: main (orchestrator)
Task: Add ID card issuance to HM + ID Operator portals with photo adjustment features and modern ID card design.

Work Log:
- Researched modern school ID card designs (dual-sided: front = photo/name/class/blood/QR; back = address/UDISE/emergency/signature/"if found" return text).
- Installed react-easy-crop (3:4 portrait crop + zoom + rotate + drag), qrcode.react (QR on card front), jspdf (available for PDF export).
- Schema: added bloodGroup, photoUrl, emergencyContact to Student; added photoUrl, photoZoom, photoPositionX/Y, cardNo, validityYear to IDCardRequest. Re-seeded (30 students with blood groups + emergency contacts; 5 ID requests with photos/cardNos/validity).
- PhotoEditor component: upload (JPG/PNG/WebP, max 8MB) → react-easy-crop cropper (aspect 3:4, zoom slider 1-3x, rotate 90°, drag to reposition, grid overlay) → canvas-based crop to 480×640 JPEG data URL → preview thumbnail → confirm.
- IDCardDesign component (modern dual-sided, 320×508pt credit-card ratio):
  • Front: gradient header band (school brand + "Identity Card · 2024-25"), decorative wave, photo (116×152 with ring), name + class pill, 2-col detail grid (Adm.No/Gender/DOB/Blood/Father/Medium/UDISE), footer with Card No + QR code (encodes student JSON) + validity.
  • Back: gradient strip, magnetic-stripe placeholder, school address, phone + UDISE cards, amber emergency-contact box, mother/medium/issued/valid-till rows, "If found, please return to" box, signature line, "internal school ID — not a government identity document" disclaimer.
- IdCardStudio: unified component for both portals — live mini card preview (scaled), photo status + "Adjust photo" button (opens PhotoEditor dialog), full-card preview dialog (tabs: Both/Front/Back), print (opens print-window with @page 54mm×86mm), download photo. Role-aware actions: ID_OPERATOR can edit photo (locked when ISSUED); HM can Issue/Reprint/Print.
- API routes: POST /api/portal/id-card (create request), POST /api/portal/id-card/[id]/photo (attach cropped photo + crop metadata, audited), POST /api/portal/id-card/[id]/issue (HM issues — assigns serial cardNo KNP-ID-YYYY-NNNN, marks ISSUED; or reprint).
- HM portal idcards section: pending SUBMITTED approvals (approve/reject inline with reason) + IdCardStudio for APPROVED/PRINTED/ISSUED (Issue card / Reprint / Print buttons + separation-of-duties banner).
- ID Operator portal: new "Studio" section (top) with IdCardStudio for all requests (photo adjust + live preview), student search with "New request" creation dialog, print queue, issued cards. Separation-of-duties banner.

Stage Summary:
- Lint clean. Agent-browser verified: HM portal → ID Cards section renders studio with Issue/Reprint/Print; issuing an APPROVED card assigns cardNo (KNP-ID-2025-1004) and marks ISSUED (confirmed in DB); full-card preview dialog shows Both/Front/Back tabs with all fields (school header, photo, name, class, blood group AB+, DOB, father, UDISE, card no, QR code, emergency contact, "if found" text, signature line). ID Operator portal → Photo Editor dialog: upload → crop (3:4) → zoom/rotate/drag → confirm → photo saved to request + student record. Modern dual-sided ID card design fully implemented and printable.
