import mongoose, { Schema, models } from "mongoose";

const ClassSubjectSchema = new Schema(
  {
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

/**
 * Prevent duplicate assignments:
 * Same subject + teacher cannot be assigned twice to the same class
 */
ClassSubjectSchema.index(
  { classId: 1, subjectId: 1, teacherId: 1 },
  { unique: true }
);

export const ClassSubject =
  models.ClassSubject || mongoose.model("ClassSubject", ClassSubjectSchema);
