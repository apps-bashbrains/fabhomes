/**
 * POST: get presigned URL for uploading one image. Admin only.
 * Body: { contentType: "image/jpeg" | "image/png" | "image/webp", filename?: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, canManageProperties } from "@/lib/auth-server";
import { createPresignedPut, getPublicUrl } from "@/lib/s3";
import { z } from "zod";

const schema = z.object({
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  filename: z.string().max(200).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageProperties(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: propertyId } = await params;
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

  const ext = parsed.data.contentType.split("/")[1] ?? "jpg";
  const key = `properties/${propertyId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const result = await createPresignedPut(key, parsed.data.contentType, 60);
  if (!result) {
    return NextResponse.json(
      { error: "S3 not configured. Set AWS_* and S3_BUCKET_PROPERTY_IMAGES." },
      { status: 503 }
    );
  }

  const url = getPublicUrl(key);
  return NextResponse.json({
    uploadUrl: result.url,
    key: result.key,
    url,
  });
}
