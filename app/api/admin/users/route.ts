/**
 * Admin users: list (all admins), create/invite (SUPER_ADMIN only), update role/status (SUPER_ADMIN only).
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAdminSession, canManageUsers } from "@/lib/auth-server";
import { UserRole, UserStatus } from "@prisma/client";

const DEFAULT_LIMIT = 50;

const createUserSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().min(10).max(15),
  email: z.string().email().optional().or(z.literal("")),
  role: z.enum([UserRole.ADMIN, UserRole.SUPPORT]),
});

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "").slice(-10);
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageUsers(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT, 100);

  const items = await prisma.user.findMany({
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: "desc" },
    where: { role: { in: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPPORT] } },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  const nextCursor = items.length > limit ? items[limit - 1]?.id : null;
  const list = items.length > limit ? items.slice(0, limit) : items;

  return NextResponse.json({ items: list, nextCursor });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageUsers(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { name, phone, email, role } = parsed.data;
  const phoneNorm = normalizePhone(phone);
  const existing = await prisma.user.findUnique({ where: { phone: phoneNorm } });
  if (existing) {
    return NextResponse.json({ error: "User with this phone already exists" }, { status: 400 });
  }

  const user = await prisma.user.create({
    data: {
      name,
      phone: phoneNorm,
      email: email && email.length > 0 ? email : null,
      role,
      status: UserStatus.ACTIVE,
    },
    select: { id: true, name: true, phone: true, email: true, role: true, status: true, createdAt: true },
  });

  return NextResponse.json(user, { status: 201 });
}
