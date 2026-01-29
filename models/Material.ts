import mongoose, { Schema, models } from "mongoose";

const MaterialSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    fileUrl: { type: String, required: true }, // could be S3, UploadThing, etc.
    type: {
      type: String,
      enum: ["PDF", "DOC", "VIDEO", "IMAGE"],
      default: "PDF",
    },

    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true, // must be a teacher/admin
    },

    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
    },
  },
  { timestamps: true }
);

export const Material =
  models.Material || mongoose.model("Material", MaterialSchema);
