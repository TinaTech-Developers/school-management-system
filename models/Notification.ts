import mongoose, { Schema, models } from "mongoose";

const NotificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    // ✅ CLASS vs SCHOOL grouping
    category: {
      type: String,
      enum: ["CLASS", "SCHOOL"],
      default: "SCHOOL",
    },

    // ✅ Icon + visual styling
    type: {
      type: String,
      enum: ["INFO", "WARNING", "FEE", "EXAM"],
      default: "INFO",
    },

    // Optional references
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
    },

    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Notification =
  models.Notification || mongoose.model("Notification", NotificationSchema);
