import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStudent extends Document {
  name: string;
  email: string;
  password: string;
  classId: string;
  parentId?: string;
  createdAt: Date;
  rollNumber?: string;
}

const studentSchema: Schema<IStudent> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  classId: { type: String, required: true },
  parentId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Student: Model<IStudent> =
  mongoose.models.Student || mongoose.model<IStudent>("Student", studentSchema);
