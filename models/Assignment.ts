import mongoose, { Schema, models } from "mongoose";

const AssignmentSchema = new Schema(
  {
    title: String,
    description: String,

    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    dueDate: Date,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Assignment =
  models.Assignment || mongoose.model("Assignment", AssignmentSchema);
