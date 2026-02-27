import mongoose, { Schema, model, models } from "mongoose";

export type AcademicStatus = "UPCOMING" | "ACTIVE" | "COMPLETED";

const TermSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { _id: false },
);

const AcademicYearSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    status: {
      type: String,
      enum: ["UPCOMING", "ACTIVE", "COMPLETED"],
      default: "UPCOMING",
    },

    isCurrent: { type: Boolean, default: false },

    terms: {
      type: [TermSchema],
      validate: {
        validator: (terms: any[]) => terms.length > 0,
        message: "At least one term is required",
      },
    },
  },
  { timestamps: true },
);

export default models.AcademicYear || model("AcademicYear", AcademicYearSchema);
