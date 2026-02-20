import mongoose, { Schema, models } from "mongoose";

const ExamSubjectSchema = new Schema(
  {
    examId: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },

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
      ref: "User", // teacher who enters marks
    },

    totalMarks: {
      type: Number,
      default: 100,
    },

    passMark: {
      type: Number,
      default: 40,
    },
  },
  { timestamps: true },
);

/**
 * One subject per class per exam
 */
ExamSubjectSchema.index(
  { examId: 1, classId: 1, subjectId: 1 },
  { unique: true },
);

export const ExamSubject =
  models.ExamSubject || mongoose.model("ExamSubject", ExamSubjectSchema);
