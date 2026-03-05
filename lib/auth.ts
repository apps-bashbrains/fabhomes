/**
 * NextAuth: OTP-based auth for both Customer and Admin.
 * Credentials: phone + otpCode (+ type: admin | customer).
 * Session: secure cookies, CSRF protection. RBAC enforced in middleware and API.
 */
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyOtp } from "@/lib/otp";
import { prisma } from "@/lib/db";
import { UserRole, UserStatus } from "@prisma/client";

const ADMIN_ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN", "SUPPORT"];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "otp",
      name: "OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
        otpCode: { label: "OTP", type: "text" },
        type: { label: "Type", type: "text" }, // "admin" | "customer"
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otpCode) return null;

        const result = await verifyOtp(credentials.phone, credentials.otpCode);
        if (!result.valid) return null;

        const normalizedPhone = credentials.phone.replace(/\D/g, "").slice(-10);
        const isAdminFlow = credentials.type === "admin";

        let user = await prisma.user.findUnique({
          where: { phone: normalizedPhone },
        });

        if (isAdminFlow) {
          if (!user || !ADMIN_ROLES.includes(user.role) || user.status !== UserStatus.ACTIVE) return null;
        } else {
          if (!user) {
            user = await prisma.user.create({
              data: {
                phone: normalizedPhone,
                role: UserRole.USER,
                status: UserStatus.ACTIVE,
              },
            });
          } else if (user.status !== UserStatus.ACTIVE) return null;
        }

        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          phone: user.phone,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "USER";
        token.phone = (user as { phone?: string }).phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { phone?: string }).phone = token.phone as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24h
  },
  pages: {
    signIn: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
