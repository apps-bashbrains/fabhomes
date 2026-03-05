/**
 * GET: single user query with notes. PATCH: status. POST: notes. PATCH assign. Admin: SUPPORT+.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getAdminSession, canManageUserQueries } from "@/lib/auth-server";
import { UserQueryStatus } from "@prisma/client";

const statusSchema = z.object({ status: z.nativeEnum(UserQueryStatus) });

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession(_req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageUserQueries(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const q = await prisma.userQuery.findUnique({
    where: { id },
    include: {
      assignedToAdminUser: { select: { id: true, name: true, phone: true } },
      notes: { orderBy: { createdAt: "desc" }, include: { adminUser: { select: { id: true, name: true, phone: true } } } },
    },
  });
  if (!q) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(q);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageUserQueries(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const q = await prisma.userQuery.findUnique({ where: { id } });
  if (!q) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const statusParsed = statusSchema.safeParse(body);
  if (statusParsed.success) {
    await prisma.userQuery.update({
      where: { id },
      data: { status: statusParsed.data.status },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Validation failed" }, { status: 400 });
}
