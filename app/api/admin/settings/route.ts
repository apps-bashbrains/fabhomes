/**
 * GET: all settings (key-value). PUT: update settings. Admin only.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getAdminSession, requireSuperAdmin } from "@/lib/auth-server";
import { auditLog } from "@/lib/audit";
import { AuditEntityType } from "@prisma/client";

const ALLOWED_KEYS = ["brand_name", "primary_color", "enable_lead_capture", "maintenance_mode"] as const;

const putSettingsSchema = z.object({
  brand_name: z.string().max(100).optional(),
  primary_color: z.string().max(50).optional(),
  enable_lead_capture: z.boolean().optional(),
  maintenance_mode: z.boolean().optional(),
}).strict();

export async function GET(_req: NextRequest) {
  const session = await getAdminSession(_req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await prisma.setting.findMany({
    where: { key: { in: [...ALLOWED_KEYS] } },
  });
  const settings: Record<string, unknown> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!requireSuperAdmin(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = putSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  for (const [key, value] of Object.entries(parsed.data)) {
    if (value === undefined) continue;
    await prisma.setting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  await auditLog(session.userId, "settings_updated", AuditEntityType.SETTINGS, "settings", {
    keys: Object.keys(parsed.data),
  });

  return NextResponse.json({ ok: true });
}
