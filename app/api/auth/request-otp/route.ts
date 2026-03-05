import { NextResponse } from "next/server";
import { z } from "zod";
import { createOtpRequest } from "@/lib/otp";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const bodySchema = z.object({
  phone: z
    .union([z.string(), z.number()])
    .transform((v) => String(v).trim())
    .refine((s) => s.length >= 10 && s.length <= 15, "Phone must be 10–15 characters"),
  type: z.enum(["customer", "admin"]).optional().default("customer"),
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";

  let body: z.infer<typeof bodySchema>;
  try {
    const raw = await req.json();
    if (raw == null || typeof raw !== "object") {
      return NextResponse.json({ error: "Body must be a JSON object with phone" }, { status: 400 });
    }
    body = bodySchema.parse(raw);
  } catch (e) {
    if (e instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const message =
      e instanceof z.ZodError
        ? e.errors.map((err) => err.message).join(", ") || "Invalid body"
        : "Invalid body";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const keyPhone = getRateLimitKey(body.phone, "otp-phone");
  const keyIp = getRateLimitKey(ip, "otp-ip");
  if (!rateLimit(keyPhone, 5, 60 * 1000) || !rateLimit(keyIp, 10, 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const result = await createOtpRequest(body.phone, ip);
  if (!result.success) {
    logger.warn("OTP request failed", { phone: body.phone.slice(-4), type: body.type, error: result.error });
    return NextResponse.json({ error: result.error ?? "Failed" }, { status: 400 });
  }
  logger.info("OTP sent", { phoneLast4: body.phone.slice(-4), type: body.type });
  return NextResponse.json({ success: true });
}
