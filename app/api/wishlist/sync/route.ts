/**
 * POST: sync property IDs from localStorage into DB wishlist (one-time after login). Requires session.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { authOptions } from "@/lib/auth";

const schema = z.object({ propertyIds: z.array(z.string().uuid()).max(200) });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id?: string }).id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.wishlistItem.findMany({
    where: { userId },
    select: { propertyId: true },
  });
  const existingIds = new Set(existing.map((e) => e.propertyId));
  const toAdd = parsed.data.propertyIds.filter((id) => !existingIds.has(id));
  if (toAdd.length === 0) return NextResponse.json({ synced: 0, message: "Already in sync" });

  const validProperties = await prisma.property.findMany({
    where: { id: { in: toAdd } },
    select: { id: true },
  });
  const validIds = new Set(validProperties.map((p) => p.id));

  for (const propertyId of toAdd) {
    if (validIds.has(propertyId)) {
      await prisma.wishlistItem.upsert({
        where: { userId_propertyId: { userId, propertyId } },
        create: { userId, propertyId },
        update: {},
      });
    }
  }

  return NextResponse.json({ synced: toAdd.filter((id) => validIds.has(id)).length });
}
