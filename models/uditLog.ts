import mongoose, { Schema, models } from "mongoose";

const AuditLogSchema = new Schema(
  {
    action: { type: String, required: true }, // e.g. "CREATE_FEE"
    description: { type: String, required: true },
    entityType: { type: String }, // "Fee", "Exam", "User"
    entityId: { type: Schema.Types.ObjectId },
    performedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const AuditLog =
  models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
