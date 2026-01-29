import mongoose, { Schema, models } from "mongoose";

const ClassSchema = new Schema(
  {
    name: { type: String, required: true }, // Grade 10 A

    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },

    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const ClassModel = models.Class || mongoose.model("Class", ClassSchema);
