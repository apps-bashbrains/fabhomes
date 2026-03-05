/**
 * Audit log for admin actions. Call from admin API handlers.
 */
import { prisma } from "@/lib/db";
import type { AuditEntityType } from "@prisma/client";
import type { Prisma } from "@prisma/client";

type ActionType = string;

export async function auditLog(
  adminUserId: string,
  actionType: ActionType,
  entityType: AuditEntityType,
  entityId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      adminUserId,
      actionType,
      entityType,
      entityId,
      metadata: (metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}
