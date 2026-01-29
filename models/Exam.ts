import mongoose, { Schema, models } from "mongoose";

const ExamSchema = new Schema(
  {
    name: { type: String, required: true }, // e.g., "Midterm Term 1"
    term: { type: String, required: true }, // "Term 1", "Term 2"
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    published: { type: Boolean, default: false }, // results published or not
    createdBy: { type: Schema.Types.ObjectId, ref: "User" }, // admin/teacher
    isPublished: Boolean,
  },
  { timestamps: true }
);

export const Exam = models.Exam || mongoose.model("Exam", ExamSchema);
