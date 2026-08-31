import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getHmData } from "@/lib/portal-data";
import { HmPortal } from "@/components/portal/hm-portal";

export const dynamic = "force-dynamic";

export default async function HmPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = (session.user as any).role;
  const schoolId = (session.user as any).schoolId;
  if (role !== "HM" || !schoolId) redirect("/portal");

  const data = await getHmData(schoolId);
  return <HmPortal data={data} />;
}
