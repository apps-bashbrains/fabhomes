/**
 * POST: add note to user query. Admin: SUPPORT+.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getAdminSession, canManageUserQueries } from "@/lib/auth-server";

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
  if (!canManageUserQueries(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: userQueryId } = await params;
  const exists = await prisma.userQuery.findUnique({ where: { id: userQueryId } });
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const followUpAt = parsed.data.followUpAt ? new Date(parsed.data.followUpAt) : null;
  const note = await prisma.userQueryNote.create({
    data: {
      userQueryId,
      adminUserId: session.userId,
      note: parsed.data.note,
      followUpAt,
    },
  });

  return NextResponse.json(note);
}
