# ZPHS Kunaparajuparva — AP School Digital Platform

A full-stack **multi-tenant School Digital Management + Learning + Administration + Government Intelligence Platform**, with **ZPHS Kunaparajuparva** as the first reference implementation.

Built on **Next.js 16 + TypeScript + Prisma + NextAuth + shadcn/ui + Recharts**.

---

## Features

### Public bilingual website (`/`)
- English + Telugu toggle (Noto Sans Telugu font)
- School profile, academics (VI–X), staff, facilities, notices, events, achievements
- SSC Question Paper Library (140 papers, filterable by year/subject/medium/type)
- Transparency, contact, sticky footer with internal-hall-ticket disclaimer

### Role-scoped portals (`/portal/*`)
Each portal exposes **only** its own functions:

| Portal | Login | Key features |
|--------|-------|--------------|
| **Headmaster** | `hm@zphsknp.edu.in` | Dashboard, students (section change), staff, roles & onboarding, HM handover, attendance charts, academics, timetable generation, exams, ID cards, schemes, notices/CMS, reports (CSV/PDF export), audit |
| **Teacher** | `teacher@zphsknp.edu.in` | My classes, attendance, marks, homework/LMS, timetable, announcements, HM handover |
| **Student** | `student@zphsknp.edu.in` | Today, homework, timetable, attendance (charts), results (subject/radar/exam-progress charts), announcements, school ID, profile, CSV/PDF export |
| **Parent** | `parent@zphsknp.edu.in` | Child dashboard, homework, attendance, results, timetable, announcements, school ID |
| **Scheme Operator** | `scheme@zphsknp.edu.in` | Scheme cases, restricted vault (Aadhaar/bank with audited reveals), reveal history |
| **ID Card Operator** | `idcard@zphsknp.edu.in` | Issuance desk: find pupil, 2×2 photo (camera/upload + crop), live card preview, issue, print (CR80) |
| **Command Center** | `meo@bapatla.gov.in` etc. | Aggregated KPIs, charts, district comparison (no PII) |

**Demo password for all accounts: `demo123`**

### Key systems
- **ID Card issuance**: 2×2 square photo (CR80 PVC), camera capture + upload + crop + zoom, modern dual-sided card design (Govt of AP, tricolour, QR, SID, valid-till), sequential card numbers `ZPHS-KUN-yy-nnn`
- **HM Handover**: leaving HM authorizes a staff member → that person onboards the new HM → auto-disables
- **Role management**: HM onboards/removes staff, creates Teacher/Scheme/ID Operator roles
- **Section change**: staff/HM can move students A↔B↔C
- **Attendance visualization**: 12 months of data, monthly trend/breakdown/pie charts
- **Performance analytics**: subject bar, radar, exam-progress charts
- **Data export**: CSV (students/attendance/marks) + PDF (report cards, class reports)
- **Timetable generation**: auto-generate per class from staff subjects
- **Notification bell**: unread count, published notices dropdown, localStorage persistence
- **Restricted vault**: Aadhaar/bank behind audited reveals (scheme-authorised only)
- **Dark professional dashboard theme**: metallic gray, white text

---

## Tech Stack
- **Framework**: Next.js 16 (App Router) + TypeScript 5
- **Database**: Prisma ORM + SQLite
- **Auth**: NextAuth.js v4 (credentials provider, JWT sessions, role + school-scoped)
- **UI**: shadcn/ui (New York) + Tailwind CSS 4 + Lucide icons
- **Charts**: Recharts (line, bar, pie, radar)
- **PDF/Export**: jsPDF + client-side CSV
- **Photo crop**: react-easy-crop
- **QR codes**: qrcode.react

---

## Getting Started

```bash
# Install dependencies
bun install

# Create database + push schema
bun run db:push

# Seed mock data (45 students, 8 staff, 11 demo users, 12 months attendance, 4 exams)
bunx tsx prisma/seed.ts

# Start dev server (http://localhost:3000)
bun run dev
```

### Login
Go to `http://localhost:3000/login` and click any demo account. Password for all: `demo123`.

---

## Project Structure
```
src/
├── app/
│   ├── page.tsx              # Public bilingual website
│   ├── login/                # Login page with demo accounts
│   ├── portal/               # Role-scoped portals (hm, teacher, student, parent, scheme, id-card, command)
│   └── api/                  # API routes (auth, id-card, notices, staff, handover, vault, timetable, students)
├── components/
│   ├── public/               # Public site components
│   ├── portal/               # Portal components (issuance-desk, id-card-design, charts, etc.)
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── auth.ts               # NextAuth config
│   ├── db.ts                 # Prisma client
│   ├── portal-data.ts        # Server data fetchers
│   ├── public-data.ts        # Public site data
│   ├── i18n.ts               # English/Telugu dictionary
│   ├── date.ts               # UTC-stable date formatting
│   └── export.ts             # CSV/PDF export utilities
└── middleware.ts             # Protects /portal/*

prisma/
├── schema.prisma             # Full database schema (School, Student, Staff, Attendance, Exam, IDCard, Vault, Handover, etc.)
└── seed.ts                   # Mock data seeder
```

---

## Blueprint Rules Enforced
- Bilingual English + Telugu throughout
- Aadhaar/bank behind audited vault (scheme-authorised only, never casually visible)
- Hall tickets are **internal school only** — never official AP SSC/DGE
- ID card operator submits, HM approves (separation of duties)
- Higher levels (MEO→DEO→State→Minister) see **aggregates only**, never individual PII

---

## License
Internal school platform — ZPHS Kunaparajuparva reference implementation.
