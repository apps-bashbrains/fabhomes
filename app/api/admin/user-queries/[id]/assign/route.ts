/**
 * PATCH: assign user query to admin. Admin: SUPPORT+.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getAdminSession, canManageUserQueries } from "@/lib/auth-server";

const assignSchema = z.object({ adminUserId: z.string().uuid().nullable() });

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageUserQueries(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const exists = await prisma.userQuery.findUnique({ where: { id } });
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = assignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  await prisma.userQuery.update({
    where: { id },
    data: { assignedToAdminUserId: parsed.data.adminUserId },
  });

  return NextResponse.json({ ok: true });
}
