import mongoose, { Schema, models } from "mongoose";

const FeeSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    amount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["PENDING", "PARTIAL", "PAID"],
      default: "PENDING",
    },

    dueDate: Date,
    paymentHistory: [
      {
        amount: Number,
        method: { type: String }, // e.g., "CASH", "CARD", "BANK"
        date: Date,
        reference: String,
      },
    ],
  },
  { timestamps: true }
);

export const Fee = models.Fee || mongoose.model("Fee", FeeSchema);
