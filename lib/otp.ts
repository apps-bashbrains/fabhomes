/**
 * OTP request creation and verification.
 * Store hashed OTP only; rate limit and attempt limits enforced by callers.
 */
import { hash, compare } from "bcryptjs";
import { randomInt } from "crypto";
import { prisma } from "@/lib/db";
import { getOtpProvider } from "@/lib/otpProvider";

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_VERIFY_ATTEMPTS = 5;
const SALT_ROUNDS = 10;

function generateCode(): string {
  return randomInt(100000, 999999).toString();
}

export async function createOtpRequest(phone: string, requestIp: string | null): Promise<{ success: boolean; error?: string }> {
  const normalizedPhone = phone.replace(/\D/g, "").slice(-10);
  if (normalizedPhone.length < 10) {
    return { success: false, error: "Invalid phone" };
  }

  const code = generateCode();
  const otpHash = await hash(code, SALT_ROUNDS);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.otpRequest.create({
    data: {
      phone: normalizedPhone,
      otpHash,
      expiresAt,
      requestIp,
      requestCount: 1,
      attemptCount: 0,
    },
  });

  try {
    const provider = getOtpProvider();
    await provider.sendOtp(normalizedPhone, code);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send OTP";
    return { success: false, error: message };
  }

  return { success: true };
}

export async function verifyOtp(phone: string, code: string): Promise<{ valid: boolean; error?: string }> {
  const normalizedPhone = phone.replace(/\D/g, "").slice(-10);

  const latest = await prisma.otpRequest.findFirst({
    where: { phone: normalizedPhone },
    orderBy: { createdAt: "desc" },
  });

  if (!latest) return { valid: false, error: "OTP not found or expired" };
  if (new Date() > latest.expiresAt) return { valid: false, error: "OTP expired" };
  if (latest.attemptCount >= MAX_VERIFY_ATTEMPTS) return { valid: false, error: "Too many attempts" };

  const valid = await compare(code, latest.otpHash);
  await prisma.otpRequest.update({
    where: { id: latest.id },
    data: { attemptCount: latest.attemptCount + 1 },
  });

  if (!valid) return { valid: false, error: "Invalid OTP" };
  return { valid: true };
}
