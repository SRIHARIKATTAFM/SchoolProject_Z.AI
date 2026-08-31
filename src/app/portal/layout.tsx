import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PortalTopbar } from "@/components/portal/portal-topbar";
import { db } from "@/lib/db";
import type { Role } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const role = (session.user as any).role as Role;
  const schoolId = (session.user as any).schoolId as string | undefined;

  let schoolName: string | undefined;
  if (schoolId) {
    const school = await db.school.findUnique({ where: { id: schoolId } });
    schoolName = school?.name ?? "ZPHS Kunaparajuparva";
  } else {
    schoolName = role === "MINISTER" ? "Government of Andhra Pradesh" : role === "STATE" ? "AP State Education" : role === "DEO" ? "Bapatla District" : "Bapatla Mandal";
  }

  return (
    <div className="dark flex min-h-screen flex-col bg-background text-foreground">
      <PortalTopbar name={session.user.name ?? ""} role={role} schoolName={schoolName} />
      <main className="flex-1">{children}</main>
      <footer className="mt-auto border-t border-border bg-background px-4 py-3 text-center text-xs text-muted-foreground">
        AP School Digital Platform · {schoolName} · Internal-use only. Hall tickets are school-internal, not official AP SSC/DGE.
      </footer>
    </div>
  );
}
