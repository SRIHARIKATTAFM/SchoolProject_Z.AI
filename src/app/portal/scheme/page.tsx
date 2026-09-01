import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSchemeData } from "@/lib/portal-data";
import { SchemePortal } from "@/components/portal/scheme-portal";

export const dynamic = "force-dynamic";

export default async function SchemePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = (session.user as any).role;
  const schoolId = (session.user as any).schoolId;
  if (role !== "SCHEME_OPERATOR" || !schoolId) redirect("/portal");

  const data = await getSchemeData(schoolId);
  return <SchemePortal data={data} />;
}
