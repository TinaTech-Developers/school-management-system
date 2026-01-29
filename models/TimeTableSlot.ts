import mongoose, { Schema, models } from "mongoose";

/**
 * Timetable Slot Schema
 * Used for:
 * - Class lessons
 * - Exams
 * - Any scheduled academic activity
 */

const TimetableSlotSchema = new Schema(
  {
    /* ================= CORE RELATIONS ================= */

    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },

    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },

    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: false,
      index: true,
    },

    /* ================= SLOT TYPE ================= */

    type: {
      type: String,
      enum: ["CLASS", "EXAM"],
      default: "CLASS",
      index: true,
    },

    /* ================= TIME ================= */

    dayOfWeek: {
      type: String,
      enum: ["MON", "TUE", "WED", "THU", "FRI", "SAT"],
      required: true,
      index: true,
    },

    startTime: {
      type: String, // "08:00"
      required: true,
    },

    endTime: {
      type: String, // "09:00"
      required: true,
    },

    /* ================= ACADEMIC CONTEXT ================= */

    academicYear: {
      type: String, // e.g. "2025"
      required: true,
      index: true,
    },

    term: {
      type: String,
      enum: ["TERM_1", "TERM_2", "TERM_3"],
      required: true,
      index: true,
    },

    /* ================= META ================= */

    locked: {
      type: Boolean,
      default: false, // prevent accidental edits
    },
  },
  { timestamps: true },
);

/* =====================================================
   INDEXES (BLOCK EXACT DUPLICATES)
   ===================================================== */

/**
 * Same class, same time, same term
 */
TimetableSlotSchema.index(
  {
    classId: 1,
    academicYear: 1,
    term: 1,
    dayOfWeek: 1,
    startTime: 1,
  },
  { unique: true },
);

/**
 * Same teacher, same time, same term
 */
TimetableSlotSchema.index(
  {
    teacherId: 1,
    academicYear: 1,
    term: 1,
    dayOfWeek: 1,
    startTime: 1,
  },
  { unique: true },
);

/**
 * Same room, same time, same term
 */
TimetableSlotSchema.index(
  {
    roomId: 1,
    academicYear: 1,
    term: 1,
    dayOfWeek: 1,
    startTime: 1,
  },
  {
    unique: true,
    sparse: true, // allow null rooms
  },
);

/* =====================================================
   MODEL EXPORT
   ===================================================== */

export const TimetableSlot =
  models.TimetableSlot || mongoose.model("TimetableSlot", TimetableSlotSchema);
