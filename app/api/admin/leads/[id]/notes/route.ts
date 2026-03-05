/**
 * POST: add note to lead. Admin only.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getAdminSession, canManageLeads } from "@/lib/auth-server";
import { auditLog } from "@/lib/audit";
import { AuditEntityType } from "@prisma/client";

const noteSchema = z.object({
  note: z.string().min(1).max(5000),
  followUpAt: z.string().datetime().optional().nullable(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageLeads(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: leadId } = await params;
  const exists = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const followUpAt = parsed.data.followUpAt ? new Date(parsed.data.followUpAt) : null;
  const leadNote = await prisma.leadNote.create({
    data: {
      leadId,
      adminUserId: session.userId,
      note: parsed.data.note,
      followUpAt,
    },
  });

  await auditLog(session.userId, "lead_note_added", AuditEntityType.LEAD, leadId, {
    noteId: leadNote.id,
  });

  return NextResponse.json(leadNote);
}
