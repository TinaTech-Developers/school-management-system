import mongoose, { Schema, models } from "mongoose";

const SubmissionSchema = new Schema(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },

    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fileUrl: String,
    submittedAt: Date,
  },
  { timestamps: true }
);

export const Submission =
  models.Submission || mongoose.model("Submission", SubmissionSchema);
