/**
 * PATCH: update property status. Admin only.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { propertyStatusSchema } from "@/lib/validations/property";
import { getAdminSession, canManageProperties } from "@/lib/auth-server";
import { auditLog } from "@/lib/audit";
import { AuditEntityType } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageProperties(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const existing = await prisma.property.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = propertyStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await prisma.property.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  await auditLog(session.userId, "property_status_changed", AuditEntityType.PROPERTY, id, {
    from: existing.status,
    to: parsed.data.status,
  });

  return NextResponse.json({ ok: true });
}
