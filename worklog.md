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

---
Task ID: 11
Agent: main (orchestrator)
Task: Fix Radix UI `aria-controls` hydration mismatch on public site.

Work Log:
- Diagnosed root cause: `next-themes` ThemeProvider injects a pre-hydration <script> that modifies <html>'s class BEFORE React hydrates. This DOM mutation causes React 19's `useId` to generate different IDs on server vs. client for every Radix UI component (Sheet trigger, Select triggers), producing `aria-controls` attribute mismatches.
- Verified no code depends on the removed providers: `useSession()` is not used anywhere (signIn/signOut work without SessionProvider — they POST directly to auth endpoints); `useTheme()` was only in sonner.tsx which is not imported (layout uses Radix Toaster, not Sonner).
- Fix: simplified `src/components/providers.tsx` to only wrap `I18nProvider` — removed `ThemeProvider` (next-themes) and `SessionProvider` (next-auth). Updated `sonner.tsx` to use `theme="light"` instead of `useTheme()`.
- Verified with Agent Browser: cleared cookies → loaded public site → zero hydration errors, zero aria-controls mismatches. SSC Library Selects (Year/Subject/Type) render and open correctly. Hard reload clean. Portal login still works (credentials POST → 200 → /portal/hm loads). Portal page also hydration-clean.

Stage Summary:
- Hydration error eliminated at its source (removed the pre-hydration script that caused useId divergence). All 8 ID card tasks from previous turn remain complete and verified. Lint clean, no runtime errors.

---
Task ID: 12
Agent: main (orchestrator)
Task: Implement Grok's school-counter ID card issuance spec (Student IDs, 2×2 square photos, camera capture, modern tricolour card design, ZPHS-KUN card numbers, dedicated issuance desk).

Work Log:
- Schema: added `sid` (SID-10-A-01) to Student; added `sidSnapshot` + `validTill` to IDCardRequest. Pushed to DB.
- Seed: updated UDISE to 28161500304; academic year 2025-26; generated SIDs for all 30 students (sorted A–Z within each class+section, assigned SID-{classNum}-{section}-{nn}); updated card numbers to ZPHS-KUN-26-{nnn} format with sidSnapshot + validTill "31 Mar 2026".
- CameraCapture component: opens webcam via getUserMedia, live preview with centre-square guide, captures square frame to canvas (480×480 JPEG), retake/confirm flow. Handles permission denied / no camera errors with fallback to upload.
- PhotoEditor: redesigned to 1:1 square (2×2 inch CR80 standard); source chooser (Open camera / Upload photo); react-easy-crop with aspect=1; zoom slider with −/+ buttons; rotate 90°; drag to reposition; canvas crop to 480×480 JPEG.
- IDCardDesign redesigned:
  • Front: "Government of Andhra Pradesh" header → school name → "School Identity Card · 2025-26" → tricolour strip (saffron #FF9933 / white / green #138808) → 2×2 square photo (110×110) → name (uppercase) → detail rows (Student ID, Class in Roman, Gender, Admission No, Valid Till) → footer with UDISE + card no (DRAFT in amber until issued) + QR code.
  • Back: tricolour strip → magnetic stripe → school name (EN+TE) → "If found, please return to" box with address + phone → emergency contact → disclaimer → signature line.
- IssuanceDesk component (counter-style UI): left panel = student register with 4 filters (Class VI–X, Section A/B/C, partial Name, exact Student ID SID-10-A-01) + scrollable student list showing SID + status badge. Right panel (appears on selection): student header → photo card (2×2 preview + Take/Upload button) → issue card (Issue identity card / Reprint / Print / View full card) → live card preview (scaled front+back) → recently issued cards list for that pupil (photo thumbnail, name, SID, status). Print opens CR80 print window (@page 54mm × 85.6mm, front+back).
- API updates: issue route now assigns ZPHS-KUN-{yy}-{nnn} (2-digit year + 3-digit sequence), snapshots student SID, computes validityYear + validTill (31 Mar of year after start). Photo + create-request routes now allow both HM and ID_OPERATOR (school counter staff).
- HM portal: idcards section replaced with IssuanceDesk (counter desk). ID Operator portal: replaced with single IssuanceDesk section.
- Fixed Turbopack stale-cache parse error (required full .next wipe + restart).

Stage Summary:
- Lint clean. Agent-browser verified: student register shows SIDs (SID-6-A-01...); selecting an ISSUED student (Divya) shows full card with "Government of Andhra Pradesh", tricolour, 2×2 photo, SID-6-A-04, Class VI-A, Valid Till 31 Mar 2026, UDISE 28161500304, Card No ZPHS-KUN-26-004, "If found please return to" back. Photo editor: source chooser (camera/upload) → upload → 1:1 crop → zoom → confirm → saved to DB. Issued Arjun's card → ZPHS-KUN-26-005 assigned, SID-6-A-01 snapshot, validTill 31 Mar 2027 (computed from current date). Both HM and ID Operator portals show the issuance desk.

---
Task ID: 13
Agent: main (orchestrator)
Task: Fix "School not configured." blank page in preview.

Work Log:
- Diagnosed via VLM analysis of user screenshots: the preview panel showed a blank white page with only "School not configured." text — the fallback message from PublicSite when data.school is null.
- Root cause: src/lib/public-data.ts hardcoded `db.school.findFirst({ where: { udise: "28141200754" } })` — the OLD UDISE. The seed was updated in Task 12 to use UDISE 28161500304, so the hardcoded lookup returned null.
- Fix: changed getPublicData() to fetch the first configured school generically (`db.school.findFirst({ orderBy: { createdAt: "asc" } })`) instead of hardcoding a UDISE that can drift during re-seeding. Also scoped all child queries (notices, events, achievements, staff, studentCount) to that school's ID so the page is always consistent. Added an early-return guard when no school exists (returns empty arrays instead of crashing).
- Verified with Agent Browser: public site now loads with "ZPHS Kunaparajuparva", hero (Classes VI–X), SSC Corner, staff grid — all sections render. `notConfigured: false`. Title correct.

Stage Summary:
- "School not configured." error eliminated. Public site loads fully in the preview panel. Lint clean. The fix is robust against future UDISE changes (no hardcoded UDISE anywhere in the data layer).

---
Task ID: 14
Agent: main (orchestrator)
Task: Fix "studentId and schoolId are required" error on photo upload and ID card issue.

Work Log:
- Diagnosed via VLM analysis of user screenshots: both the photo-upload and reissue/issue flows showed a red "Error — studentId and schoolId are required" toast.
- Root cause: the `SchoolLite` interface in `issuance-desk.tsx` had no `id` field, and the HM portal's `schoolLite` object didn't include `data.school.id`. So when `ensureRequest()` called `POST /api/portal/id-card` with `{ studentId: selected.id, schoolId: school.id }`, `school.id` was `undefined` → the API returned 400 "studentId and schoolId are required".
- Fix: added `id: string` to the `SchoolLite` interface; added `id: data.school.id` to the `schoolLite` object in `hm-portal.tsx`. The ID Operator portal already passed the full Prisma school object (which has `id`), so it was unaffected.
- Verified with Agent Browser: logged in as HM → ID Cards → selected Eshwar (SUBMITTED, no photo) → uploaded photo → 1:1 crop → confirm → "Photo saved" toast (no error). Clicked "Issue identity card" → "issued" toast + ZPHS-KUN-26-007 assigned (confirmed in DB: status ISSUED, cardNo ZPHS-KUN-26-007, sidSnapshot SID-6-A-05, validTill 31 Mar 2027). No error toasts on either flow.

Stage Summary:
- "studentId and schoolId are required" error eliminated. Both photo upload and ID card issue/reissue flows work cleanly. Lint clean.

---
Task ID: 15
Agent: main (orchestrator)
Task: Complete HM dashboard, dark theme, mobile responsive, section change, role management, HM handover, expand mock data.

Work Log:
- Schema: added StaffOnboarding + HMHandover models (with fromHM relation). Pushed to DB.
- Seed expanded: 45 students across VI–X with sections A/B/C (VI=A only, VII/VIII=A+B, IX=A+B+C, X=A+B). Each student gets SID-{classNum}-{section}-{nn} sorted A–Z within section. 45 SIDs generated.
- Dark professional portal theme: portal layout applies `dark` class → metallic gray palette (charcoal background oklch(0.18), white text oklch(0.97), green accent). VLM-verified: "sleek dark mode, high contrast, highly readable".
- Mobile responsiveness: PortalScaffold changed to `flex-col lg:flex-row` (stacks on mobile); all table CardContents get `overflow-x-auto scroll-thin`; IssuanceDesk card preview uses fixed-width scaled containers (176×279px) instead of `scale-[0.6]` to prevent layout overflow. Verified: 390px viewport, scrollWidth=390 (no horizontal overflow).
- Section change feature: API `POST /api/portal/students/[id]/section` (HM/ID_OPERATOR/TEACHER can change A↔B↔C). SectionChangeButton component with dialog. Verified: changed Arjun Reddy from A to B (VI) — audit logged.
- HM dashboard completed: attendance section now shows real stats (total/present/absent) + class-wise breakdown table (VI–X with rates). All nav items have distinct labels (Roles & Onboarding, HM Handover).
- Role management: StaffManager component — onboard staff dialog (name/email/designation/subject/phone/role/password), staff cards with remove button (deactivates login). API `POST /api/portal/staff/onboard` (creates Staff+User immediately) + `POST /api/portal/staff/[id]` (remove). Verified: onboarded "Test Teacher" as School Assistant (TEACHER) — audit logged.
- HM handover workflow: HMHandoverPanel — HM selects a staff member to authorize (POST /api/portal/handover). Authorized user sees "Onboard New Headmaster" panel (POST /api/portal/handover/onboard-hm). Onboarding a new HM consumes the authorization (status ACTIVE→CONSUMED), auto-disabling the option. Verified: HM authorized "Test Teacher" → handover ACTIVE in DB. Non-HM staff cannot create HM accounts without active handover.
- Fixed parse errors (Turbopack cache), Prisma relation errors (fromHM field).

Stage Summary:
- Lint clean. 45 students with sections A/B/C. Dark metallic-gray professional dashboard with white text. All portal pages mobile responsive (390px verified, no overflow). ID card dialogs render correctly on mobile + desktop. Section change works (A→B verified). Role onboarding works (Test Teacher created). HM handover authorization works (ACTIVE in DB). All HM dashboard sections show real data.

---
Task ID: 16
Agent: main (orchestrator)
Task: Fix HM Handover — 3 bugs identified and fixed.

Work Log:
- Diagnosed via Agent Browser testing:
  • Bug 1: `OnboardHMPanel` checked only `handover?.status === "ACTIVE"` — so the current HM (who granted the authorization) ALSO saw the "Onboard new HM" panel. Should only be visible to the authorized user.
  • Bug 2: The authorized user (e.g. a Teacher) logs into the Teacher portal, which had NO handover section — so they could never actually onboard the new HM.
  • Bug 3: Leftover "ACTIVE" handover from a previous test session polluted the state.
- Fix 1: `OnboardHMPanel` now checks `isAuthorized = handover?.status === "ACTIVE" && handover?.authorizedUser?.id === currentUserId`. Passes `operatorId` as `currentUserId`. The HM who granted the authorization does NOT see the onboard panel.
- Fix 2: Created `StaffHandoverPanel` component — a standalone panel for non-HM staff (Teacher, ID Operator) that shows the "Onboard New Headmaster" panel IF they're the authorized user, or a status info card otherwise. Added "HM Handover" nav item to both Teacher portal and ID Operator portal. Updated `getTeacherData` and `getIdOperatorData` to include the `handover` record.
- Fix 3: Cleared leftover handover + test teacher data from DB.
- Verified full flow end-to-end:
  1. HM logs in → HM Handover → selects "P. Lakshmi Devi" → grants authorization → handover ACTIVE in DB. HM sees "Authorization is ACTIVE" but does NOT see "Onboard new HM" panel.
  2. Teacher (Lakshmi) logs in → Teacher portal → HM Handover nav item → sees "Onboard New Headmaster" panel (authorized by outgoing HM).
  3. Teacher onboards "New HM Rao" (newhm@zphsknp.edu.in) → new HM user created with role HM → handover auto-changes to CONSUMED → onboard panel disappears, "Handover complete" shown.
  4. New HM logs in with newhm@zphsknp.edu.in → Headmaster Dashboard loads. Handover complete.
- Cleaned up test data.

Stage Summary:
- HM Handover fully working: HM authorizes → authorized staff sees onboard panel → onboards new HM → auto-disables. The current HM never sees the onboard button. Teachers and ID Operators now have a "HM Handover" section in their portals. Lint clean, no errors.
