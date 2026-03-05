import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { createLeadSchema } from "@/lib/validations/lead";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { LeadSource } from "@prisma/client";
import { authOptions } from "@/lib/auth";

const DEDUPE_HOURS = 24;

export async function POST(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = req.headers.get("user-agent") ?? null;
  const session = await getServerSession(authOptions);

  const key = getRateLimitKey(ip, "leads");
  if (!rateLimit(key, 10, 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { propertyId, name, mobile, email, message, interestedInSimilar } = parsed.data;
  const emailVal = email && email.length > 0 ? email : null;

  const settings = await prisma.setting.findUnique({
    where: { key: "enable_lead_capture" },
  });
  const captureEnabled = settings?.value !== false;
  if (!captureEnabled) {
    return NextResponse.json({ success: true, message: "Thank you." });
  }

  if (propertyId) {
    const since = new Date(Date.now() - DEDUPE_HOURS * 60 * 60 * 1000);
    const existing = await prisma.lead.findFirst({
      where: {
        propertyId,
        mobile: mobile.trim(),
        createdAt: { gte: since },
        duplicateOfLeadId: null,
      },
      orderBy: { createdAt: "desc" },
    });
    if (existing) {
      await prisma.lead.create({
        data: {
          propertyId,
          name: name.trim(),
          mobile: mobile.trim(),
          email: emailVal,
          message: message?.trim() ?? null,
          interestedInSimilar: interestedInSimilar ?? false,
          status: "NEW",
          source: LeadSource.WEB,
          duplicateOfLeadId: existing.id,
          userId: (session?.user as { id?: string } | undefined)?.id ?? null,
          ipAddress: ip,
          userAgent,
        },
      });
      return NextResponse.json({ success: true, message: "Thank you. We will be in touch." });
    }
  }

  await prisma.lead.create({
    data: {
      propertyId: propertyId ?? null,
      name: name.trim(),
      mobile: mobile.trim(),
      email: emailVal,
      message: message?.trim() ?? null,
      interestedInSimilar: interestedInSimilar ?? false,
      status: "NEW",
      source: LeadSource.WEB,
      userId: (session?.user as { id?: string } | undefined)?.id ?? null,
      ipAddress: ip,
      userAgent,
    },
  });

  return NextResponse.json({ success: true, message: "Thank you. Our team will contact you shortly." });
}
