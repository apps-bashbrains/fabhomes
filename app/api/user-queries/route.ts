/**
 * POST: submit a "what I'm looking for" user query (requirement request). Public, rate limited.
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { createUserQuerySchema } from "@/lib/validations/user-query";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { authOptions } from "@/lib/auth";
import { PropertyMode, PropertyType } from "@prisma/client";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
  const key = getRateLimitKey(ip, "user-query");
  if (!rateLimit(key, 10, 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createUserQuerySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;

  const {
    name,
    mobile,
    email,
    mode,
    city,
    locationText,
    propertyType,
    budgetMin,
    budgetMax,
    bhk,
    message,
  } = parsed.data;

  await prisma.userQuery.create({
    data: {
      userId,
      name: name ?? null,
      mobile: mobile.trim(),
      email: email && email.length > 0 ? email : null,
      mode: mode as PropertyMode,
      city,
      locationText: locationText ?? null,
      propertyType: propertyType as PropertyType ?? null,
      budgetMin: budgetMin != null ? BigInt(budgetMin) : null,
      budgetMax: budgetMax != null ? BigInt(budgetMax) : null,
      bhk: bhk ?? null,
      message,
    },
  });

  return NextResponse.json({ success: true, message: "We will get back to you shortly." });
}
