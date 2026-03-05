/**
 * GET: list leads (paginated). GET with ?export=csv: CSV download. Admin only.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, canManageLeads } from "@/lib/auth-server";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageLeads(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  if (searchParams.get("export") === "csv") {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const status = searchParams.get("status") ?? undefined;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (from || to) {
      where.createdAt = {};
      if (from) (where.createdAt as Record<string, Date>).gte = new Date(from);
      if (to) (where.createdAt as Record<string, Date>).lte = new Date(to);
    }
    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { property: { select: { id: true, title: true, city: true } } },
      take: 10000,
    });
    const header = "Name,Mobile,Email,Message,Status,Property,City,Created At\n";
    const rows = leads.map(
      (l) =>
        `"${(l.name || "").replace(/"/g, '""')}","${(l.mobile || "").replace(/"/g, '""')}","${(l.email || "").replace(/"/g, '""')}","${(l.message || "").replace(/"/g, '""')}","${l.status}","${(l.property?.title || "").replace(/"/g, '""')}","${(l.property?.city || "").replace(/"/g, '""')}","${l.createdAt.toISOString()}"`
    );
    const csv = header + rows.join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, MAX_LIMIT);
  const status = searchParams.get("status") ?? undefined;
  const propertyId = searchParams.get("propertyId") ?? undefined;
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (propertyId) where.propertyId = propertyId;
  if (from || to) {
    where.createdAt = {};
    if (from) (where.createdAt as Record<string, Date>).gte = new Date(from);
    if (to) (where.createdAt as Record<string, Date>).lte = new Date(to);
  }

  const items = await prisma.lead.findMany({
    where,
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: "desc" },
    include: {
      property: { select: { id: true, title: true, city: true } },
    },
  });

  const nextCursor = items.length > limit ? items[limit - 1]?.id : null;
  const list = items.length > limit ? items.slice(0, limit) : items;

  return NextResponse.json({ items: list, nextCursor });
}
