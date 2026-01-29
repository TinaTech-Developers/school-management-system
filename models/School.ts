import mongoose, { Schema, models } from "mongoose";

const SchoolSchema = new Schema(
  {
    name: { type: String, required: true },
    address: String,
    phone: String,
    email: String,

    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const School = models.School || mongoose.model("School", SchoolSchema);
