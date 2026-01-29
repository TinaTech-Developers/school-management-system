import mongoose, { Schema, models } from "mongoose";

const LearningMaterialSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    fileUrl: { type: String }, // For uploaded PDFs, docs, videos
    fileType: { type: String }, // "pdf", "doc", "video", "link"
    link: { type: String }, // Optional external link
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tags: [{ type: String }], // Optional tags for filtering
  },
  { timestamps: true },
);

export const LearningMaterial =
  models.LearningMaterial ||
  mongoose.model("LearningMaterial", LearningMaterialSchema);
