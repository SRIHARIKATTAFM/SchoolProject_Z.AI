import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTeacherData } from "@/lib/portal-data";
import { TeacherPortal } from "@/components/portal/teacher-portal";

export const dynamic = "force-dynamic";

export default async function TeacherPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = (session.user as any).role;
  const schoolId = (session.user as any).schoolId;
  const staffId = (session.user as any).staffId;
  if (role !== "TEACHER" || !schoolId || !staffId) redirect("/portal");

  const data = await getTeacherData(schoolId, staffId);
  return <TeacherPortal data={data} userId={(session.user as any).id} />;
}
