/**
 * POST: approve listing request → create Property from request, link submittedByUserId, set status PUBLISHED.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, canManageListingRequests } from "@/lib/auth-server";
import { auditLog } from "@/lib/audit";
import { AuditEntityType } from "@prisma/client";
import { ListedBy, FurnishingType } from "@prisma/client";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession(_req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageListingRequests(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const lr = await prisma.listingRequest.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!lr) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (lr.status === "REJECTED") {
    return NextResponse.json({ error: "Request already rejected" }, { status: 400 });
  }

  const property = await prisma.property.create({
    data: {
      mode: lr.mode,
      propertyType: lr.propertyType,
      title: lr.title ?? `${lr.propertyType} in ${lr.city}`,
      description: lr.description,
      locationText: lr.locationText,
      city: lr.city,
      state: null,
      price: lr.price,
      currency: "INR",
      bhk: lr.bhk,
      areaSqFt: lr.areaSqFt,
      floorInfo: null,
      furnishing: (lr.furnishing as FurnishingType) ?? "UNFURNISHED",
      listedBy: ListedBy.OWNER,
      listingContactName: null,
      listingContactPhone: null,
      listingContactEmail: null,
      status: "VERIFIED",
      isActive: true,
      isFeatured: false,
      isNew: true,
      publishedAt: new Date(),
      createdByAdminUserId: session.userId,
      submittedByUserId: lr.userId,
    },
  });

  for (const img of lr.images) {
    await prisma.propertyImage.create({
      data: {
        propertyId: property.id,
        s3Key: img.s3Key,
        url: img.url,
        sortOrder: img.sortOrder,
        isMain: img.sortOrder === 0,
      },
    });
  }

  await prisma.listingRequest.update({
    where: { id },
    data: { status: "PUBLISHED", adminReviewerId: session.userId },
  });

  await auditLog(session.userId, "listing_request_approved", AuditEntityType.LISTING_REQUEST, id, {
    propertyId: property.id,
  });

  return NextResponse.json({ ok: true, propertyId: property.id });
}
