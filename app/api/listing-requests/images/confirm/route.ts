/**
 * POST: confirm listing request image after client upload. Requires session; user must own the listing request.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { getPublicUrl } from "@/lib/s3";
import { z } from "zod";
import { authOptions } from "@/lib/auth";

const schema = z.object({
  listingRequestId: z.string().uuid(),
  key: z.string().min(1),
  sortOrder: z.number().int().optional(),
});

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

  const request = await prisma.listingRequest.findFirst({
    where: { id: parsed.data.listingRequestId, userId },
  });
  if (!request) return NextResponse.json({ error: "Listing request not found" }, { status: 404 });

  const url = getPublicUrl(parsed.data.key);
  const count = await prisma.listingRequestImage.count({ where: { listingRequestId: request.id } });
  const sortOrder = parsed.data.sortOrder ?? count;

  const image = await prisma.listingRequestImage.create({
    data: {
      listingRequestId: request.id,
      s3Key: parsed.data.key,
      url,
      sortOrder,
    },
  });

  return NextResponse.json(image);
}
