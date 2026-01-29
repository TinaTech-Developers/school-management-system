// classroom model
import mongoose, { Schema, models } from "mongoose";

const RoomSchema = new Schema(
  {
    name: { type: String, required: true }, // e.g., "Room 101"
    capacity: { type: Number, default: 30 }, // number of students it can hold
    location: { type: String }, // e.g., "Building A, First Floor"
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" }, // admin/teacher
  },
  { timestamps: true },
);

export const Room = models.Room || mongoose.model("Room", RoomSchema);
