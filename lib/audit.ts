import { AuditLog } from "@/models/uditLog";

export async function logAudit({
  action,
  description,
  entityType,
  entityId,
  performedBy,
}: any) {
  await AuditLog.create({
    action,
    description,
    entityType,
    entityId,
    performedBy,
  });
}
