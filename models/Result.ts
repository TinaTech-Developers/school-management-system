import mongoose, { Schema, models } from "mongoose";

const ResultSchema = new Schema(
  {
    examId: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },

    examSubjectId: {
      type: Schema.Types.ObjectId,
      ref: "ExamSubject",
      required: true,
    },

    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    score: {
      type: Number,
      required: true,
    },

    remarks: {
      type: String,
    },

    enteredBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // teacher/admin
      required: true,
    },

    /* ================= ADMIN CONTROL ================= */

    published: {
      type: Boolean,
      default: false,
    },

    publishedAt: {
      type: Date,
    },

    publishedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    grade: {
      type: String,
    },
    gpa: {
      type: Number,
    },
  },
  { timestamps: true },
);

/**
 * Prevent duplicate results
 */
ResultSchema.index(
  { examId: 1, examSubjectId: 1, studentId: 1 },
  { unique: true },
);

export const Result = models.Result || mongoose.model("Result", ResultSchema);
