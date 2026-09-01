import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getParentData } from "@/lib/portal-data";
import { ParentPortal } from "@/components/portal/parent-portal";

export const dynamic = "force-dynamic";

export default async function ParentPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = (session.user as any).role;
  const studentId = (session.user as any).studentId;
  if (role !== "PARENT" || !studentId) redirect("/portal");

  const data = await getParentData(studentId);
  if (!data) redirect("/portal");
  return <ParentPortal data={data} />;
}
