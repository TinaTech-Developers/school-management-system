import mongoose, { Schema, models } from "mongoose";

const ExamSubjectSchema = new Schema(
  {
    examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // who enters marks
    totalMarks: { type: Number, default: 100 },
    passMarks: { type: Number, default: 40 },
  },
  { timestamps: true }
);

/**
 * Prevent duplicate assignment: same exam + class + subject + teacher
 */
ExamSubjectSchema.index(
  { examId: 1, classId: 1, subjectId: 1, teacherId: 1 },
  { unique: true }
);

export const ExamSubject =
  models.ExamSubject || mongoose.model("ExamSubject", ExamSubjectSchema);
