/**
 * GET: list properties (paginated, cursor). Admin only.
 * POST: create property. Admin only.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createPropertySchema } from "@/lib/validations/property";
import { getAdminSession, canManageProperties } from "@/lib/auth-server";
import { auditLog } from "@/lib/audit";
import { AuditEntityType } from "@prisma/client";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageProperties(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, MAX_LIMIT);
  const mode = searchParams.get("mode") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const city = searchParams.get("city") ?? undefined;

  const where: Record<string, unknown> = {};
  if (mode) where.mode = mode;
  if (status) where.status = status;
  if (city) where.city = { contains: city, mode: "insensitive" };

  const items = await prisma.property.findMany({
    where,
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      _count: { select: { leads: true } },
    },
  });

  const nextCursor = items.length > limit ? items[limit - 1]?.id : null;
  const list = items.length > limit ? items.slice(0, limit) : items;

  return NextResponse.json({
    items: list,
    nextCursor,
  });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageProperties(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createPropertySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { amenityIds, ...rest } = parsed.data;
  const property = await prisma.property.create({
    data: {
      ...rest,
      createdByAdminUserId: session.userId,
    },
  });

  if (amenityIds && amenityIds.length > 0) {
    await prisma.propertyAmenity.createMany({
      data: amenityIds.map((amenityId: string) => ({ propertyId: property.id, amenityId })),
      skipDuplicates: true,
    });
  }

  await auditLog(session.userId, "property_created", AuditEntityType.PROPERTY, property.id, {
    title: property.title,
  });

  return NextResponse.json(property);
}
