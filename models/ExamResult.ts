import mongoose, { Schema, models } from "mongoose";

const ExamResultSchema = new Schema(
  {
    examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
    examSubjectId: {
      type: Schema.Types.ObjectId,
      ref: "ExamSubject",
      required: true,
    },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    marks: { type: Number, required: true },
  },
  { timestamps: true },
);

/**
 * One result per student per exam subject
 */
ExamResultSchema.index({ examSubjectId: 1, studentId: 1 }, { unique: true });

export const ExamResult =
  models.ExamResult || mongoose.model("ExamResult", ExamResultSchema);
