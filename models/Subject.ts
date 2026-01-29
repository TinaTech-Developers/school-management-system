// models/Subject.ts
import mongoose, { Schema, models } from "mongoose";

const SubjectSchema = new Schema(
  {
    name: { type: String, required: true }, // Mathematics
    code: { type: String, required: true }, // MTH101 (optional)

    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "School",
      required: false,
      index: false,
    },

    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },

    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User", // TEACHER
      required: true,
    },

    isCompulsory: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const Subject =
  models.Subject || mongoose.model("Subject", SubjectSchema);
