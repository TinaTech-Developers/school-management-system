import { Schema, model, models } from "mongoose";

const verificationTokenSchema = new Schema({
  identifier: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  expires: { type: Date, required: true },
});

verificationTokenSchema.index({ identifier: 1, token: 1 }, { unique: true });

export const VerificationToken =
  models.VerificationToken ||
  model("VerificationToken", verificationTokenSchema);
