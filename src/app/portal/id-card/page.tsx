import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getIdOperatorData } from "@/lib/portal-data";
import { IdCardPortal } from "@/components/portal/id-card-portal";

export const dynamic = "force-dynamic";

export default async function IdCardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = (session.user as any).role;
  const schoolId = (session.user as any).schoolId;
  const userId = (session.user as any).id;
  if (role !== "ID_OPERATOR" || !schoolId || !userId) redirect("/portal");

  const data = await getIdOperatorData(schoolId, userId);
  return <IdCardPortal data={data} />;
}
