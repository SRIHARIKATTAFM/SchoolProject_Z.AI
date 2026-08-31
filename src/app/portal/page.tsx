import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Role } from "@/lib/auth";

const ROUTE: Record<Role, string> = {
  HM: "/portal/hm",
  TEACHER: "/portal/teacher",
  STUDENT: "/portal/student",
  PARENT: "/portal/parent",
  SCHEME_OPERATOR: "/portal/scheme",
  ID_OPERATOR: "/portal/id-card",
  MEO: "/portal/command",
  DEO: "/portal/command",
  STATE: "/portal/command",
  MINISTER: "/portal/command",
};

export const dynamic = "force-dynamic";

export default async function PortalIndex() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = (session.user as any).role as Role;
  redirect(ROUTE[role] ?? "/portal/hm");
}
