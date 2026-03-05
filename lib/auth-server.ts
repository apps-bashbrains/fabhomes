import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "SUPPORT"] as const;

export async function getAdminSession(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!token?.id || typeof token.role !== "string" || !ADMIN_ROLES.includes(token.role as (typeof ADMIN_ROLES)[number])) return null;
  return {
    userId: token.id as string,
    role: token.role as string,
    email: (token.email as string) ?? undefined,
    phone: (token.phone as string) ?? undefined,
  };
}

export function requireSuperAdmin(role: string): boolean {
  return role === "SUPER_ADMIN";
}

export function canManageUsers(role: string): boolean {
  return role === "SUPER_ADMIN";
}

export function canManageProperties(role: string): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export function canManageLeads(role: string): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN" || role === "SUPPORT";
}

export function canManageUserQueries(role: string): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN" || role === "SUPPORT";
}

export function canManageListingRequests(role: string): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}
