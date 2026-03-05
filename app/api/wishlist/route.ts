/**
 * GET: list wishlist (requires session).
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _req: NextRequest
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          mode: true,
          propertyType: true,
          city: true,
          price: true,
          bhk: true,
          status: true,
          isActive: true,
          images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
        },
      },
    },
  });

  return NextResponse.json({
    items: items.map((i) => ({ id: i.id, propertyId: i.propertyId, property: i.property, createdAt: i.createdAt })),
  });
}
