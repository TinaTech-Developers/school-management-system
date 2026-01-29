import mongoose, { Schema, models } from "mongoose";

const GradeSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    score: Number,
    term: String, // Term 1, Term 2
  },
  { timestamps: true }
);

export const Grade = models.Grade || mongoose.model("Grade", GradeSchema);
