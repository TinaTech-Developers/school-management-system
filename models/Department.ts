import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IDepartment extends Document {
  name: string;
  description?: string;
  head?: Types.ObjectId; // can be a teacher or admin
  schoolId: string;
  createdAt: Date;
}

const departmentSchema = new Schema<IDepartment>({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  head: { type: Schema.Types.ObjectId, ref: "User" },
  schoolId: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

export const Department: Model<IDepartment> =
  mongoose.models.Department ||
  mongoose.model<IDepartment>("Department", departmentSchema);
