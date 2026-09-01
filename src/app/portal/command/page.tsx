import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCommandData } from "@/lib/portal-data";
import { CommandPortal } from "@/components/portal/command-portal";

export const dynamic = "force-dynamic";

export default async function CommandPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = (session.user as any).role as string;
  const schoolId = (session.user as any).schoolId as string | undefined;
  if (!["MEO", "DEO", "STATE", "MINISTER"].includes(role)) redirect("/portal");

  const data = await getCommandData(role, schoolId);
  if (!data) redirect("/portal");
  return <CommandPortal data={data} />;
}
