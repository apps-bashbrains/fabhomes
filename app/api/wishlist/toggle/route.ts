/**
 * POST: toggle property in wishlist (add if not present, remove if present). Requires session.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { auditLog } from "@/lib/audit";
import { AuditEntityType } from "@prisma/client";

const toggleSchema = z.object({ propertyId: z.string().uuid() });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = toggleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { propertyId } = parsed.data;

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_propertyId: { userId, propertyId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    if ((session.user as { role?: string }).role && (session.user as { role?: string }).role !== "USER") {
      // Only audit if we have an admin-like context; customer wishlist toggle is optional to audit
      try {
        await auditLog(userId, "wishlist_removed", AuditEntityType.WISHLIST, propertyId, {});
      } catch {
        // ignore
      }
    }
    return NextResponse.json({ added: false, message: "Removed from wishlist" });
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true },
  });
  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  await prisma.wishlistItem.create({
    data: { userId, propertyId },
  });

  try {
    await auditLog(userId, "wishlist_added", AuditEntityType.WISHLIST, propertyId, {});
  } catch {
    // ignore
  }

  return NextResponse.json({ added: true, message: "Added to wishlist" });
}
