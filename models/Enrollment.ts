import mongoose, { Schema, models } from "mongoose";

const EnrollmentSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
  },
  { timestamps: true }
);

export const Enrollment =
  models.Enrollment || mongoose.model("Enrollment", EnrollmentSchema);
