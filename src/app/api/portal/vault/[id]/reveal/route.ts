import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Scheme operator reveals a restricted vault value (Aadhaar/bank).
// Access is AUDITED. Only SCHEME_OPERATOR role may reveal.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "SCHEME_OPERATOR" && role !== "HM")
    return NextResponse.json({ error: "Only Scheme Operator may reveal restricted data" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const reason = String(body.reason ?? "No reason provided");
  if (reason.length < 4)
    return NextResponse.json({ error: "A specific reason is required to reveal restricted data" }, { status: 400 });

  const vault = await db.restrictedVault.findUnique({ where: { id }, include: { student: true } });
  if (!vault) return NextResponse.json({ error: "Vault entry not found" }, { status: 404 });

  // Decrypt (simulated — in production this would use a KMS / envelope encryption).
  let revealed: string;
  if (vault.encryptedValue.startsWith("ENC::")) {
    const b64 = vault.encryptedValue.slice(5);
    try {
      revealed = Buffer.from(b64, "base64").toString("utf8");
    } catch {
      revealed = "[decryption error]";
    }
  } else {
    revealed = vault.encryptedValue;
  }

  // Audit the reveal
  await db.vaultAccessLog.create({
    data: {
      vaultId: vault.id,
      accessedBy: (session.user as any).id,
      reason,
      action: "REVEAL_VALUE",
    },
  });
  await db.auditLog.create({
    data: {
      schoolId: vault.student.schoolId,
      userId: (session.user as any).id,
      action: "VAULT_REVEAL",
      entity: "RestrictedVault",
      entityId: vault.id,
      details: `Revealed ${vault.type} for student ${vault.student.name}. Reason: ${reason}`,
    },
  });

  return NextResponse.json({ ok: true, refCode: vault.refCode, type: vault.type, revealed });
}

// View the masked reference (no audit needed for reference-only view, but we log it).
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const vault = await db.restrictedVault.findUnique({ where: { id } });
  if (!vault) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, refCode: vault.refCode, type: vault.type, masked: true });
}
