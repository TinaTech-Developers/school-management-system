import mongoose from "mongoose";

const StudentSubjectSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
  },
  { timestamps: true },
);

// prevent duplicates
StudentSubjectSchema.index({ studentId: 1, subjectId: 1 }, { unique: true });

export const StudentSubject =
  mongoose.models.StudentSubject ||
  mongoose.model("StudentSubject", StudentSubjectSchema);
