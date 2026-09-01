import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStudentData } from "@/lib/portal-data";
import { StudentPortal } from "@/components/portal/student-portal";

export const dynamic = "force-dynamic";

export default async function StudentPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = (session.user as any).role;
  const studentId = (session.user as any).studentId;
  if (role !== "STUDENT" || !studentId) redirect("/portal");

  const data = await getStudentData(studentId);
  if (!data) redirect("/portal");
  return <StudentPortal data={data} />;
}
