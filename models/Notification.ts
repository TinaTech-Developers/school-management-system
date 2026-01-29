import mongoose, { Schema, models } from "mongoose";

const NotificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    title: String,
    message: String,
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Notification =
  models.Notification || mongoose.model("Notification", NotificationSchema);
