/**
 * GET: list user queries (paginated). Admin: SUPPORT+.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, canManageUserQueries } from "@/lib/auth-server";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageUserQueries(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, MAX_LIMIT);
  const status = searchParams.get("status") ?? undefined;
  const city = searchParams.get("city") ?? undefined;
  const mode = searchParams.get("mode") ?? undefined;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (city) where.city = { contains: city, mode: "insensitive" };
  if (mode) where.mode = mode;

  const items = await prisma.userQuery.findMany({
    where,
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: "desc" },
    include: {
      assignedToAdminUser: { select: { id: true, name: true, phone: true } },
    },
  });

  const nextCursor = items.length > limit ? items[items.length - 1]?.id : null;
  const list = items.length > limit ? items.slice(0, limit) : items;

  return NextResponse.json({ items: list, nextCursor });
}
