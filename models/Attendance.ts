import mongoose, { Schema, models } from "mongoose";

/**
 * Attendance Schema
 * - Tracks student attendance for a specific timetable slot (lesson) on a specific date
 * - Allows teacher to mark Present, Absent, Late, or Excused
 */
const AttendanceSchema = new Schema(
  {
    // The student attending the lesson
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // The class that the lesson belongs to
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },

    // The specific timetable slot (lesson)
    slotId: {
      type: Schema.Types.ObjectId,
      ref: "TimetableSlot",
      required: true,
      index: true,
    },

    // Date of the lesson
    date: {
      type: Date,
      required: true,
      index: true,
    },

    // Attendance status
    status: {
      type: String,
      enum: ["PRESENT", "ABSENT", "LATE", "EXCUSED"],
      default: "PRESENT",
      required: true,
    },

    // Teacher who marked the attendance
    markedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Optional notes or remarks
    remarks: {
      type: String,
      default: "",
    },

    // Lock attendance after submission
    locked: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);

/**
 * Prevent duplicate attendance for same student in same slot on same date
 */
AttendanceSchema.index({ studentId: 1, slotId: 1, date: 1 }, { unique: true });

export const Attendance =
  models.Attendance || mongoose.model("Attendance", AttendanceSchema);
