import { db } from "../src/lib/db";
import bcrypt from "bcryptjs";

// ─── Helpers ───────────────────────────────────────────────────────────
const CLASSES = ["VI", "VII", "VIII", "IX", "X"];
const SECTIONS = ["A"];
const SUBJECTS_TE = [
  "Telugu",
  "Hindi",
  "English",
  "Mathematics",
  "General Science",
  "Physical Science",
  "Biological Science",
  "Social Studies",
];
const SUBJECTS_EM = ["English", "Mathematics", "General Science", "Social Studies"];

const teluguNames = {
  // used for nameTe where reasonable
  school: "జెడ్‌పీహెచ్‌ఎస్ కుణపరాజుపర్వ",
  about:
    "జిల్లా పరిషత్ ఉన్నత పాఠశాల, కుణపరాజుపర్వ గ్రామంలో ఉన్న ప్రభుత్వ పాఠశాల. తెలుగు మాధ్యమంలో విద్యా బోధన. 6 నుండి 10 తరగతుల వరకు.",
};

function hash(pw: string) {
  return bcrypt.hashSync(pw, 10);
}
function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}
function pad(n: number, len = 3) {
  return String(n).padStart(len, "0");
}
function date(y: number, m: number, d: number) {
  return new Date(y, m - 1, d);
}

async function main() {
  console.log("🌱 Seeding ZPHS Kunaparajuparva…");

  // wipe (order matters for FKs)
  await db.vaultAccessLog.deleteMany();
  await db.restrictedVault.deleteMany();
  await db.schemeApplication.deleteMany();
  await db.iDCardRequest.deleteMany();
  await db.homeworkSubmission.deleteMany();
  await db.homework.deleteMany();
  await db.hallTicket.deleteMany();
  await db.mark.deleteMany();
  await db.exam.deleteMany();
  await db.timetable.deleteMany();
  await db.attendance.deleteMany();
  await db.staffAttendance.deleteMany();
  await db.staffAssignment.deleteMany();
  await db.studentGuardian.deleteMany();
  await db.enrolment.deleteMany();
  await db.guardian.deleteMany();
  await db.sSCPaper.deleteMany();
  await db.achievement.deleteMany();
  await db.event.deleteMany();
  await db.notice.deleteMany();
  await db.auditLog.deleteMany();
  await db.user.deleteMany();
  await db.staff.deleteMany();
  await db.student.deleteMany();
  await db.school.deleteMany();

  // ─── School ────────────────────────────────────────────────────────
  const school = await db.school.create({
    data: {
      udise: "28141200754",
      name: "ZPHS Kunaparajuparva",
      nameTe: teluguNames.school,
      mandal: "Bapatla",
      district: "Bapatla",
      state: "Andhra Pradesh",
      established: 1965,
      medium: "TM",
      address: "Kunaparajuparva Village, Bapatla Mandal, Bapatla District, Andhra Pradesh - 522410",
      phone: "08643-224587",
      email: "zphs.kunaparajuparva@gmail.com",
      headmaster: "Sri. K. Rama Rao",
      config: JSON.stringify({ academicYear: "2024-25", terms: ["FA1", "FA2", "SA1", "SA2"] }),
    },
  });

  // ─── Staff ────────────────────────────────────────────────────────
  const staffSeed = [
    { name: "K. Rama Rao", te: "కె. రామా రావు", desig: "Headmaster", subject: "Social Studies", qual: "M.A., B.Ed.", phone: "9848011001" },
    { name: "P. Lakshmi Devi", te: "పి. లక్ష్మీ దేవి", desig: "School Assistant", subject: "Mathematics", qual: "M.Sc., B.Ed.", phone: "9848011002" },
    { name: "S. Krishna Murthy", te: "ఎస్. కృష్ణ మూర్తి", desig: "School Assistant", subject: "Physical Science", qual: "M.Sc., B.Ed.", phone: "9848011003" },
    { name: "G. Saraswathi", te: "జి. సరస్వతి", desig: "School Assistant", subject: "Biological Science", qual: "M.Sc., B.Ed.", phone: "9848011004" },
    { name: "N. Venkateswarlu", te: "ఎన్. వెంకటేశ్వర్లు", desig: "School Assistant", subject: "English", qual: "M.A., B.Ed.", phone: "9848011005" },
    { name: "D. Anjali", te: "డి. అంజలి", desig: "SGT", subject: "Telugu", qual: "B.A., B.Ed.", phone: "9848011006" },
    { name: "M. Hari Prasad", te: "ఎం. హరి ప్రసాద్", desig: "SGT", subject: "Hindi", qual: "B.A., B.Ed.", phone: "9848011007" },
    { name: "R. Padmavathi", te: "ఆర్. పద్మావతి", desig: "PET", subject: "Physical Education", qual: "B.P.Ed.", phone: "9848011008" },
  ];

  const staffRecords = [];
  for (let i = 0; i < staffSeed.length; i++) {
    const s = staffSeed[i];
    const st = await db.staff.create({
      data: {
        schoolId: school.id,
        employeeId: `EMP-${pad(i + 1)}`,
        name: s.name,
        nameTe: s.te,
        designation: s.desig,
        subject: s.subject,
        phone: s.phone,
        email: `${s.name.split(" ")[0].toLowerCase()}@zphsknp.edu.in`,
        qualification: s.qual,
        joiningDate: date(2005 + i, 6, 15),
        status: i === 7 ? "ON_LEAVE" : "ACTIVE",
        assignments: {
          create: [
            {
              className: pick(CLASSES, i),
              section: "A",
              subject: s.subject,
              role: i === 0 ? "CLASS_TEACHER" : "SUBJECT_TEACHER",
            },
          ],
        },
      },
    });
    staffRecords.push(st);
  }

  // ─── Students (VI-X, ~6 per class = 30) ────────────────────────────
  const studentFirst = ["Arjun", "Bhavya", "Charan", "Divya", "Eshwar", "Fathima", "Ganesh", "Harika", "Karthik", "Lalitha", "Mahesh", "Navya", "Pavan", "Queeny", "Ramesh", "Sowmya", "Tarun", "Usha", "Vamsi", "Yamini", "Akash", "Bhargavi", "Chaitanya", "Deepak", "Gayatri", "Hemanth", "Indira", "Jaya", "Kiran", "Lakshmi"];
  const lastNames = ["Reddy", "Rao", "Naidu", "Chowdary", "Kumar", "Devi", "Prasad", "Lakshmi", "Sri", "Babu"];
  const fatherFirst = ["Sri. Suresh", "Sri. Mohan", "Sri. Ramesh", "Sri. Pradeep", "Sri. Naresh", "Sri. Venkat", "Sri. Gopi", "Sri. Anil", "Sri. Srinu", "Sri. Subbarao"];

  const students = [];
  let admissionCounter = 1001;
  const today = new Date();
  for (let c = 0; c < CLASSES.length; c++) {
    const cls = CLASSES[c];
    for (let n = 0; n < 6; n++) {
      const idx = c * 6 + n;
      const name = `${studentFirst[idx % studentFirst.length]} ${lastNames[n % lastNames.length]}`;
      const gender = idx % 2 === 0 ? "M" : "F";
      const ageOffset = 11 + c; // VI~11, X~15
      const st = await db.student.create({
        data: {
          schoolId: school.id,
          admissionNo: `KNP/${2024}/${pad(admissionCounter++, 4)}`,
          name,
          nameTe: null,
          fatherName: `${fatherFirst[n % fatherFirst.length]} ${lastNames[n % lastNames.length]}`,
          motherName: `Smt. ${studentFirst[(idx + 5) % studentFirst.length]} ${lastNames[n % lastNames.length]}`,
          gender,
          dob: date(2024 - ageOffset, (n % 12) + 1, (n % 27) + 1),
          category: pick(["OC", "BC-A", "BC-D", "SC", "ST"], idx),
          medium: "TM",
          rollNo: String(n + 1),
          status: "ACTIVE",
          enrolments: {
            create: {
              academicYear: "2024-25",
              className: cls,
              section: "A",
              status: "ENROLLED",
            },
          },
        },
      });
      students.push({ ...st, class: cls, section: "A" });
    }
  }

  // ─── Guardians (one primary per student) ───────────────────────────
  for (const s of students) {
    const g = await db.guardian.create({
      data: {
        name: s.fatherName,
        nameTe: null,
        relationship: "FATHER",
        phone: `9${700000000 + Math.floor(Math.random() * 99999999)}`,
        email: null,
        occupation: pick(["Farmer", "Daily Wage", "Teacher", "Driver", "Weaver", "Mason"], students.indexOf(s)),
        students: {
          create: { studentId: s.id, isPrimary: true },
        },
      },
    });
    // link a parent user to first 3 students (demo parent logins)
  }

  // ─── Users for every role (demo accounts, all password: demo123) ─
  // Created early so ID-card & scheme rows can reference real operator/HM ids.
  const pw = hash("demo123");
  const hmStaff = staffRecords[0];
  const hmUser = await db.user.create({
    data: { email: "hm@zphsknp.edu.in", password: pw, name: hmStaff.name, role: "HM", schoolId: school.id, staffId: hmStaff.id },
  });
  const tStaff = staffRecords[1];
  await db.user.create({
    data: { email: "teacher@zphsknp.edu.in", password: pw, name: tStaff.name, role: "TEACHER", schoolId: school.id, staffId: tStaff.id },
  });
  const stUser = students.find((s) => s.class === "X")!;
  await db.user.create({
    data: { email: "student@zphsknp.edu.in", password: pw, name: stUser.name, role: "STUDENT", schoolId: school.id, studentId: stUser.id },
  });
  // Parent is linked to a DIFFERENT class X child (studentId is unique per user).
  const parentChild = students.filter((s) => s.class === "X")[1]!;
  await db.user.create({
    data: { email: "parent@zphsknp.edu.in", password: pw, name: parentChild.fatherName, role: "PARENT", schoolId: school.id, studentId: parentChild.id },
  });
  const schemeOp = await db.user.create({
    data: { email: "scheme@zphsknp.edu.in", password: pw, name: "Scheme Operator (MEO Office)", role: "SCHEME_OPERATOR", schoolId: school.id },
  });
  const idOp = await db.user.create({
    data: { email: "idcard@zphsknp.edu.in", password: pw, name: "ID Card Operator", role: "ID_OPERATOR", schoolId: school.id },
  });
  await db.user.create({ data: { email: "meo@bapatla.gov.in", password: pw, name: "Mandal Education Officer", role: "MEO" } });
  await db.user.create({ data: { email: "deo@bapatla.gov.in", password: pw, name: "District Education Officer", role: "DEO" } });
  await db.user.create({ data: { email: "state@ap.gov.in", password: pw, name: "State Education Dept", role: "STATE" } });
  await db.user.create({ data: { email: "minister@ap.gov.in", password: pw, name: "Education Minister", role: "MINISTER" } });

  // ─── Attendance (last 30 working days for class X) ─────────────────
  const classX = students.filter((s) => s.class === "X");
  for (let d = 0; d < 30; d++) {
    const day = date(2024, 11, d + 1); // Dec 2024
    if (day.getDay() === 0) continue; // skip Sunday
    for (const s of classX) {
      const r = Math.random();
      const status = r > 0.92 ? "ABSENT" : r > 0.88 ? "LATE" : "PRESENT";
      await db.attendance.create({
        data: {
          studentId: s.id,
          date: day,
          status,
          className: "X",
          section: "A",
          markedBy: staffRecords[1].id,
        },
      });
    }
  }
  // attendance summary for other classes (a few days)
  for (const s of students.filter((s) => s.class !== "X")) {
    for (let d = 1; d <= 5; d++) {
      await db.attendance.create({
        data: {
          studentId: s.id,
          date: date(2024, 12, d),
          status: Math.random() > 0.9 ? "ABSENT" : "PRESENT",
          className: s.class,
          section: "A",
          markedBy: staffRecords[1].id,
        },
      });
    }
  }

  // ─── Staff attendance (last 30 days) ──────────────────────────────
  for (let d = 0; d < 30; d++) {
    const day = date(2024, 11, d + 1);
    if (day.getDay() === 0) continue;
    for (const st of staffRecords) {
      await db.staffAttendance.create({
        data: {
          staffId: st.id,
          date: day,
          status: st.status === "ON_LEAVE" ? "ON_LEAVE" : Math.random() > 0.97 ? "ABSENT" : "PRESENT",
        },
      });
    }
  }

  // ─── Timetable (class X) ──────────────────────────────────────────
  const periods = [
    { p: 1, s: "09:30", e: "10:15" },
    { p: 2, s: "10:15", e: "11:00" },
    { p: 3, s: "11:15", e: "12:00" },
    { p: 4, s: "12:00", e: "12:45" },
    { p: 5, s: "13:45", e: "14:30" },
    { p: 6, s: "14:30", e: "15:15" },
    { p: 7, s: "15:15", e: "16:00" },
  ];
  const daySubs = ["Telugu", "English", "Mathematics", "Physical Science", "Biological Science", "Social Studies", "Hindi"];
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
  for (const day of days) {
    for (const per of periods) {
      await db.timetable.create({
        data: {
          schoolId: school.id,
          className: "X",
          section: "A",
          day,
          period: per.p,
          subject: pick(daySubs, (periods.indexOf(per) + days.indexOf(day)) % daySubs.length),
          staffId: staffRecords[(periods.indexOf(per) + 1) % staffRecords.length].id,
          startTime: per.s,
          endTime: per.e,
        },
      });
    }
  }

  // ─── Exams + marks (FA1 for class X) ──────────────────────────────
  const exam = await db.exam.create({
    data: {
      schoolId: school.id,
      name: "FA1",
      className: "X",
      section: "A",
      academicYear: "2024-25",
      startDate: date(2024, 8, 12),
      endDate: date(2024, 8, 16),
      type: "INTERNAL_SCHOOL",
    },
  });
  const examSubjects = ["Telugu", "English", "Mathematics", "Physical Science", "Biological Science", "Social Studies"];
  for (const s of classX) {
    for (const subj of examSubjects) {
      const m = 20 + Math.floor(Math.random() * 60); // 20-80 out of 100
      await db.mark.create({
        data: {
          examId: exam.id,
          studentId: s.id,
          subject: subj,
          marks: m,
          maxMarks: 100,
          grade: m >= 90 ? "A1" : m >= 80 ? "A2" : m >= 70 ? "B1" : m >= 60 ? "B2" : m >= 50 ? "C1" : m >= 40 ? "C2" : "D",
        },
      });
    }
    // internal hall ticket (NOT official SSC/DGE)
    await db.hallTicket.create({
      data: {
        examId: exam.id,
        studentId: s.id,
        rollNo: `X-A-${s.rollNo}`,
        printedCount: 1,
        type: "INTERNAL_SCHOOL",
      },
    });
  }

  // ─── Homework (class X) ───────────────────────────────────────────
  const hwSeed = [
    { subject: "Mathematics", title: "Quadratic Equations — Exercise 5.1", desc: "Solve problems 1–10 from chapter 5. Show all working steps.", days: 2 },
    { subject: "Physical Science", title: "Chemical Reactions — Lab Report", desc: "Write observations from the acid-base reaction demonstration.", days: 3 },
    { subject: "English", title: "Essay: My Role Model", desc: "Write a 250-word essay on your role model with reasons.", days: 2 },
    { subject: "Biological Science", title: "Diagram: Human Heart", desc: "Draw and label the human heart. Explain blood flow.", days: 1 },
  ];
  for (const h of hwSeed) {
    const hw = await db.homework.create({
      data: {
        schoolId: school.id,
        className: "X",
        section: "A",
        subject: h.subject,
        title: h.title,
        description: h.desc,
        dueDate: new Date(Date.now() + h.days * 86400000),
        staffId: staffRecords[1].id,
      },
    });
    // submissions for first 3 students
    for (const s of classX.slice(0, 4)) {
      await db.homeworkSubmission.create({
        data: {
          homeworkId: hw.id,
          studentId: s.id,
          status: Math.random() > 0.5 ? "SUBMITTED" : "PENDING",
          submittedAt: Math.random() > 0.5 ? new Date() : null,
          content: "Completed all problems as instructed.",
        },
      });
    }
  }

  // ─── ID Card requests (workflow: operator submits, HM approves) ───
  // Some SUBMITTED (awaiting HM), some APPROVED, some ISSUED
  const idStatuses = ["SUBMITTED", "APPROVED", "PRINTED", "ISSUED", "SUBMITTED"];
  for (let i = 0; i < 5; i++) {
    const s = students[i];
    const status = idStatuses[i];
    await db.iDCardRequest.create({
      data: {
        schoolId: school.id,
        studentId: s.id,
        requestedById: idOp.id,
        status,
        cardType: i === 2 ? "REPLACEMENT" : "NEW",
        submittedAt: date(2024, 12, 1 + i),
        approvedById: status !== "SUBMITTED" ? hmUser.id : null,
        approvedAt: status !== "SUBMITTED" ? date(2024, 12, 2 + i) : null,
        printedAt: status === "PRINTED" || status === "ISSUED" ? date(2024, 12, 3 + i) : null,
        issuedAt: status === "ISSUED" ? date(2024, 12, 4 + i) : null,
      },
    });
  }

  // ─── Scheme applications + restricted vault ───────────────────────
  const schemes = [
    { name: "Amma Vodi", needBank: true, needAadhaar: true },
    { name: "Jagananna Vidya Kanuka", needBank: false, needAadhaar: true },
    { name: "Pre-Matric Scholarship (SC/ST)", needBank: true, needAadhaar: true },
  ];
  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    const scheme = schemes[i % schemes.length];
    const status = pick(["SUBMITTED", "VERIFIED", "APPROVED", "DRAFT"], i);
    // create vault entries (encrypted/masked) for first 10 students
    let aadhaarRef: string | null = null;
    let bankRef: string | null = null;
    if (scheme.needAadhaar && i < 10) {
      const vault = await db.restrictedVault.create({
        data: {
          studentId: s.id,
          type: "AADHAAR",
          refCode: `AAD-XXXX${pad(1000 + i, 4)}`,
          encryptedValue: `ENC::${Buffer.from(`1234-5678-9012-${pad(3000 + i, 4)}`).toString("base64")}`,
        },
      });
      aadhaarRef = vault.refCode;
    }
    if (scheme.needBank && i < 10) {
      const vault = await db.restrictedVault.create({
        data: {
          studentId: s.id,
          type: "BANK",
          refCode: `BNK-XXXX${pad(2000 + i, 4)}`,
          encryptedValue: `ENC::${Buffer.from(`SBI-${pad(50000000 + i, 8)}-IFSC:SBIN0001234`).toString("base64")}`,
        },
      });
      bankRef = vault.refCode;
    }
    await db.schemeApplication.create({
      data: {
        schoolId: school.id,
        studentId: s.id,
        schemeName: scheme.name,
        status,
        operatorId: schemeOp.id,
        aadhaarRef,
        bankRef,
      },
    });
  }

  // ─── Notices (CMS) ────────────────────────────────────────────────
  const notices = [
    { t: "SA1 Examinations Schedule — January 2025", te: "ఎస్‌ఎ1 పరీక్షల షెడ్యూల్ — జనవరి 2025", c: "Summative Assessment-1 for classes VI–X will commence from 6th January 2025.", cat: "EXAM" },
    { t: "School Holiday — Republic Day", te: "పాఠశాల సెలవు — గణతంత్ర దినోత్సవం", c: "The school will remain closed on 26th January 2025 in observance of Republic Day.", cat: "HOLIDAY" },
    { t: "Parent-Teacher Meeting — Class X", te: "తల్లిదండ్రుల-ఉపాధ్యాయుల సమావేశం — 10వ తరగతి", c: "PTM for Class X parents on 18th January 2025 at 10:30 AM in the school hall.", cat: "MEETING" },
    { t: "Admissions Open for 2025-26 — Class VI", te: "2025-26 ప్రవేశాలు ప్రారంభం — 6వ తరగతి", c: "Applications for Class VI admission for academic year 2025-26 are now open.", cat: "ADMISSION" },
    { t: "Sports Day Celebration", te: "క్రీడల దినోత్సవ వేడుక", c: "Annual Sports Day will be celebrated on 14th February 2025. All students must participate.", cat: "GENERAL" },
  ];
  for (const n of notices) {
    await db.notice.create({
      data: {
        schoolId: school.id,
        title: n.t,
        titleTe: n.te,
        content: n.c,
        contentTe: n.te ? `${n.te} — వివరాల కోసం పాఠశాలను సంప్రదించండి.` : null,
        category: n.cat,
        status: "PUBLISHED",
        publishedAt: date(2024, 12, 1 + notices.indexOf(n)),
      },
    });
  }

  // ─── Events ───────────────────────────────────────────────────────
  const events = [
    { t: "Annual Day 2025", te: "వార్షికోత్సవం 2025", d: "Cultural programmes, prize distribution and chief guest address.", date: date(2025, 2, 20), loc: "School Ground" },
    { t: "Science Exhibition", te: "సైన్స్ ఎగ్జిబిషన్", d: "Inter-class science models exhibition by VI–X students.", date: date(2025, 1, 28), loc: "Science Block" },
    { t: "Independence Day Flag Hoisting", te: "స్వాతంత్ర్య దినోత్సవ జెండా ఆహ్వానం", d: "Flag hoisting at 8:00 AM followed by cultural programmes.", date: date(2025, 8, 15), loc: "School Ground" },
  ];
  for (const e of events) {
    await db.event.create({
      data: { schoolId: school.id, title: e.t, titleTe: e.te, description: e.d, date: e.date, location: e.loc },
    });
  }

  // ─── Achievements ─────────────────────────────────────────────────
  const ach = [
    { t: "District Level Science Fair — 1st Prize", te: "జిల్లా స్థాయి సైన్స్ ఫెయిర్ — మొదటి బహుమతి", d: "Our students won first prize at the Bapatla district science fair 2024.", lvl: "DISTRICT", date: date(2024, 11, 15) },
    { t: "Mandal Sports Meet — Overall Championship", te: "మండల క్రీడలు — సమగ్ర ఛాంపియన్‌షిప్", d: "ZPHS Kunaparajuparva won the overall championship at the Bapatla mandal sports meet.", lvl: "MANDAL", date: date(2024, 10, 5) },
    { t: "100% SSC Result — 2024 Batch", te: "100% ఎస్‌ఎస్‌సి ఫలితం — 2024 బ్యాచ్", d: "All 32 students of the 2024 batch passed the SSC examination with distinction.", lvl: "SCHOOL", date: date(2024, 4, 22) },
    { t: "State Level Essay Writing — Consolation", te: "రాష్ట్ర స్థాయి వ్యాస రచన — ప్రోత్సాహక బహుమతి", d: "K. Bhavya of Class X received a consolation prize at the state-level essay competition.", lvl: "STATE", date: date(2024, 9, 10) },
  ];
  for (const a of ach) {
    await db.achievement.create({
      data: { schoolId: school.id, title: a.t, titleTe: a.te, description: a.d, level: a.lvl, date: a.date },
    });
  }

  // ─── SSC central paper library (null school = shared) ─────────────
  const sscSubjects = [
    { s: "Telugu", te: "తెలుగు" },
    { s: "English", te: null },
    { s: "Mathematics", te: "గణితం" },
    { s: "General Science", te: "సాధారణ శాస్త్రం" },
    { s: "Social Studies", te: "సాంఘిక శాస్త్రం" },
  ];
  const docTypes = ["ACTUAL_PAPER", "MODEL_PAPER", "BLUEPRINT", "SUPPLEMENTARY"];
  const years = [2024, 2023, 2022, 2021, 2020, 2019, 2018];
  for (const y of years) {
    for (const sub of sscSubjects) {
      for (const dt of docTypes) {
        await db.sSCPaper.create({
          data: {
            schoolId: null,
            year: y,
            subject: sub.s,
            subjectTe: sub.te,
            medium: sub.s === "English" ? "EM" : "TM",
            docType: dt,
            title: `SSC ${y} ${sub.s} (${dt.replace("_", " ").toLowerCase()}) — ${sub.s === "English" ? "EM" : "TM"}`,
            fileUrl: null,
          },
        });
      }
    }
  }

  // ─── Vault access log (audited reveal example) ────────────────────
  const firstVault = await db.restrictedVault.findFirst();
  if (firstVault) {
    await db.vaultAccessLog.create({
      data: {
        vaultId: firstVault.id,
        accessedBy: schemeOp.id,
        reason: "Amma Vodi bank verification",
        action: "VIEW_REF",
      },
    });
  }

  // ─── Audit logs ───────────────────────────────────────────────────
  await db.auditLog.create({
    data: { schoolId: school.id, userId: hmUser.id, action: "LOGIN", entity: "User", entityId: hmUser.id, details: "HM logged in" },
  });

  console.log(`✅ Seeded: 1 school, ${staffRecords.length} staff, ${students.length} students, notices/events/achievements, SSC library (${years.length * sscSubjects.length * docTypes.length} papers), 11 demo users.`);
  console.log("   Demo password for all accounts: demo123");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
