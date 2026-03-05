/**
 * POST: create listing request (user wants to list property). Requires session.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { createListingRequestSchema } from "@/lib/validations/listing-request";
import { authOptions } from "@/lib/auth";
import { PropertyMode, PropertyType, FurnishingType } from "@prisma/client";

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

  const parsed = createListingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const listingRequest = await prisma.listingRequest.create({
    data: {
      userId,
      mode: data.mode as PropertyMode,
      propertyType: data.propertyType as PropertyType,
      title: data.title ?? null,
      locationText: data.locationText,
      city: data.city,
      price: BigInt(data.price),
      bhk: data.bhk ?? null,
      areaSqFt: data.areaSqFt ?? null,
      furnishing: (data.furnishing as FurnishingType) ?? null,
      description: data.description,
    },
  });

  return NextResponse.json(listingRequest, { status: 201 });
}
