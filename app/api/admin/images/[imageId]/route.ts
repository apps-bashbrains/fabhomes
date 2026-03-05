/**
 * DELETE: remove property image. Admin only.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, canManageProperties } from "@/lib/auth-server";
import { auditLog } from "@/lib/audit";
import { AuditEntityType } from "@prisma/client";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  const session = await getAdminSession(_req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageProperties(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { imageId } = await params;
  const image = await prisma.propertyImage.findUnique({
    where: { id: imageId },
  });
  if (!image) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.propertyImage.delete({ where: { id: imageId } });

  if (image.isMain) {
    const nextImage = await prisma.propertyImage.findFirst({
      where: { propertyId: image.propertyId },
      orderBy: { sortOrder: "asc" },
    });
    if (nextImage) {
      await prisma.propertyImage.update({
        where: { id: nextImage.id },
        data: { isMain: true },
      });
    }
  }

  await auditLog(session.userId, "image_removed", AuditEntityType.IMAGE, imageId, {
    propertyId: image.propertyId,
  });

  return NextResponse.json({ ok: true });
}
