/**
 * GET: single listing request. PATCH: status. POST approve: create Property. POST reject: reject with reason.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getAdminSession, canManageListingRequests } from "@/lib/auth-server";
import { auditLog } from "@/lib/audit";
import { AuditEntityType } from "@prisma/client";
import { ListingRequestStatus } from "@prisma/client";

const statusSchema = z.object({ status: z.nativeEnum(ListingRequestStatus) });

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession(_req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageListingRequests(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const req = await prisma.listingRequest.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, phone: true, email: true } },
      images: { orderBy: { sortOrder: "asc" } },
      adminReviewer: { select: { id: true, name: true } },
    },
  });
  if (!req) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(req);
}

export async function PATCH(
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

  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  await prisma.listingRequest.update({
    where: { id },
    data: { status: parsed.data.status, adminReviewerId: session.userId },
  });

  await auditLog(session.userId, "listing_request_status", AuditEntityType.LISTING_REQUEST, id, { status: parsed.data.status });
  return NextResponse.json({ ok: true });
}
