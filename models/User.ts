import mongoose, { Schema, Document, Model, Types } from "mongoose";

/* ---------------- TYPES ---------------- */

export type UserRole = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  schoolId: string;
  phone?: string;

  /* STUDENT ONLY */
  classId?: Types.ObjectId;
  parentId?: Types.ObjectId;

  /* TEACHER ONLY */
  subjects?: string[];

  /* PARENT ONLY */
  childrenIds?: Types.ObjectId[];

  createdAt: Date;
}

/* ---------------- SCHEMA ---------------- */

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
      required: true,
      index: true,
    },

    schoolId: {
      type: String,
      required: true,
      index: true,
    },

    phone: { type: String },

    /* ---------- STUDENT ---------- */
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
    },

    parentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    /* ---------- TEACHER ---------- */
    subjects: {
      type: [String],
      default: undefined, // prevents empty array pollution
    },

    /* ---------- PARENT ---------- */
    childrenIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

/* ---------------- ROLE SAFETY ---------------- */

/**
 * Prevent invalid fields for roles
 */ userSchema.pre("save", async function () {
  if (this.role !== "STUDENT") {
    this.classId = undefined;
    this.parentId = undefined;
  }

  if (this.role !== "TEACHER") {
    this.subjects = undefined;
  }

  if (this.role !== "PARENT") {
    this.childrenIds = undefined;
  }
});

/* ---------------- MODEL ---------------- */

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
