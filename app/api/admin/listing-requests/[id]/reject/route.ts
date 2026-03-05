/**
 * POST: reject listing request with reason.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getAdminSession, canManageListingRequests } from "@/lib/auth-server";
import { auditLog } from "@/lib/audit";
import { AuditEntityType } from "@prisma/client";

const rejectSchema = z.object({ reason: z.string().min(1).max(1000) });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageListingRequests(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const listingRequest = await prisma.listingRequest.findUnique({ where: { id } });
  if (!listingRequest) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = rejectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  await prisma.listingRequest.update({
    where: { id },
    data: { status: "REJECTED", rejectionReason: parsed.data.reason, adminReviewerId: session.userId },
  });

  await auditLog(session.userId, "listing_request_rejected", AuditEntityType.LISTING_REQUEST, id, {
    reason: parsed.data.reason,
  });

  return NextResponse.json({ ok: true });
}
