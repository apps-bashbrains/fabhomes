/**
 * PATCH: update admin user role/status (SUPER_ADMIN only).
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAdminSession, canManageUsers } from "@/lib/auth-server";
import { UserRole, UserStatus } from "@prisma/client";

const updateUserSchema = z.object({
  role: z.enum([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPPORT, UserRole.USER]).optional(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.DISABLED]).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageUsers(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const data: { role?: UserRole; status?: UserStatus } = {};
  if (parsed.data.role !== undefined) data.role = parsed.data.role;
  if (parsed.data.status !== undefined) data.status = parsed.data.status;

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, phone: true, email: true, role: true, status: true, updatedAt: true },
  });

  return NextResponse.json(updated);
}
