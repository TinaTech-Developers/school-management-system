// models/Exam.ts
import mongoose, { Schema, models } from "mongoose";

const ExamSchema = new Schema(
  {
    name: { type: String, required: true }, // "Term 1 Midterm"
    term: { type: String, required: true }, // "Term 1"
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true },
    classIds: [{ type: Schema.Types.ObjectId, ref: "Class" }],

    startDate: Date,
    endDate: Date,

    isPublished: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const Exam = models.Exam || mongoose.model("Exam", ExamSchema);
