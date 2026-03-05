/**
 * PATCH: update lead status. Admin only.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getAdminSession, canManageLeads } from "@/lib/auth-server";
import { auditLog } from "@/lib/audit";
import { AuditEntityType } from "@prisma/client";

const statusSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "CLOSED_WON", "CLOSED_LOST", "SPAM"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageLeads(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const existing = await prisma.lead.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await prisma.lead.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  await auditLog(session.userId, "lead_status_changed", AuditEntityType.LEAD, id, {
    from: existing.status,
    to: parsed.data.status,
  });

  return NextResponse.json({ ok: true });
}
