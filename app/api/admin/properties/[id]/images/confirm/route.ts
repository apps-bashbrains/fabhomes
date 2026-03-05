/**
 * POST: confirm image after client upload. Creates PropertyImage. Admin only.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, canManageProperties } from "@/lib/auth-server";
import { getPublicUrl } from "@/lib/s3";
import { auditLog } from "@/lib/audit";
import { AuditEntityType } from "@prisma/client";
import { z } from "zod";

const schema = z.object({
  key: z.string().min(1),
  alt: z.string().max(200).optional().nullable(),
  sortOrder: z.number().int().optional(),
  isMain: z.boolean().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageProperties(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: propertyId } = await params;
  const exists = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!exists) return NextResponse.json({ error: "Property not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const url = getPublicUrl(parsed.data.key);
  const count = await prisma.propertyImage.count({ where: { propertyId } });
  const sortOrder = parsed.data.sortOrder ?? count;
  const isMain = parsed.data.isMain ?? (count === 0);

  if (isMain) {
    await prisma.propertyImage.updateMany({
      where: { propertyId },
      data: { isMain: false },
    });
  }

  const image = await prisma.propertyImage.create({
    data: {
      propertyId,
      s3Key: parsed.data.key,
      url,
      alt: parsed.data.alt ?? null,
      sortOrder,
      isMain,
    },
  });

  await auditLog(session.userId, "image_added", AuditEntityType.IMAGE, image.id, {
    propertyId,
  });

  return NextResponse.json(image);
}
