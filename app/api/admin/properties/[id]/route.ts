/**
 * GET: single property. PUT: update property. Admin only.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updatePropertySchema } from "@/lib/validations/property";
import { getAdminSession, canManageProperties } from "@/lib/auth-server";
import { auditLog } from "@/lib/audit";
import { AuditEntityType } from "@prisma/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession(_req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageProperties(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      amenities: { include: { amenity: true } },
    },
  });
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(property);
}

export async function PUT(
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

  const parsed = updatePropertySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { amenityIds, ...rest } = parsed.data;
  await prisma.property.update({
    where: { id },
    data: rest,
  });

  if (amenityIds !== undefined) {
    await prisma.propertyAmenity.deleteMany({ where: { propertyId: id } });
    if (amenityIds.length > 0) {
      await prisma.propertyAmenity.createMany({
        data: amenityIds.map((amenityId: string) => ({ propertyId: id, amenityId })),
        skipDuplicates: true,
      });
    }
  }

  await auditLog(session.userId, "property_updated", AuditEntityType.PROPERTY, id, {
    title: existing.title,
  });

  const property = await prisma.property.findUnique({
    where: { id },
    include: { images: true, amenities: { include: { amenity: true } } },
  });
  return NextResponse.json(property);
}
