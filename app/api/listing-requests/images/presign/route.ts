/**
 * POST: get presigned URL for uploading listing request image. Requires session; user must own the listing request.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { createPresignedPut, getPublicUrl } from "@/lib/s3";
import { z } from "zod";
import { authOptions } from "@/lib/auth";

const schema = z.object({
  listingRequestId: z.string().uuid(),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  filename: z.string().max(200).optional(),
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

  const ext = parsed.data.contentType.split("/")[1] ?? "jpg";
  const key = `listing-requests/${parsed.data.listingRequestId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const result = await createPresignedPut(key, parsed.data.contentType, 60);
  if (!result) {
    return NextResponse.json({ error: "Upload not configured" }, { status: 503 });
  }

  const url = getPublicUrl(key);
  return NextResponse.json({ uploadUrl: result.url, key: result.key, url });
}
