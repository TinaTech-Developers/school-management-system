import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Fee } from "@/models/Fee";
import { verifyAdmin, verifyStudent, verifyParent } from "@/lib/rbac";
import type { JWT } from "next-auth/jwt";
import "@/models/School"; // 🔥 just ensure it's loade
import "@/models/Class"; // 🔥 just ensure it's loaded

// GET all fees (Admin only)
export async function GET(req: Request) {
  await connectDB();

  const adminCheck = await verifyAdmin(req);
  if (adminCheck instanceof NextResponse) return adminCheck;

  const fees = await Fee.find()
    .populate("studentId", "name email")
    .populate("classId", "name")
    .lean();

  return NextResponse.json(fees);
}

// POST: Admin creates new fee for a student/class
export async function POST(req: Request) {
  await connectDB();

  const adminCheck = await verifyAdmin(req);
  if (adminCheck instanceof NextResponse) return adminCheck;

  const { studentId, classId, amount, dueDate } = await req.json();

  if (!studentId || !classId || !amount) {
    return NextResponse.json(
      { error: "studentId, classId and amount are required" },
      { status: 400 },
    );
  }

  const newFee = await Fee.create({
    studentId,
    classId,
    amount,
    dueDate,
    status: "PENDING",
    paidAmount: 0,
    paymentHistory: [],
  });

  return NextResponse.json(newFee, { status: 201 });
}

// PUT: Pay fee (Student/Parent)
export async function PUT(req: Request) {
  await connectDB();

  const studentCheck = await verifyStudent(req);
  const parentCheck = await verifyParent(req);
  if (studentCheck && parentCheck) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { feeId, amount, method, reference } = await req.json();

  if (!feeId || !amount || !method) {
    return NextResponse.json(
      { error: "feeId, amount, and method are required" },
      { status: 400 },
    );
  }

  const fee = await Fee.findById(feeId);
  if (!fee)
    return NextResponse.json({ error: "Fee not found" }, { status: 404 });

  // Update paid amount and payment history
  fee.paidAmount += amount;
  fee.paymentHistory.push({
    amount,
    method,
    reference,
    date: new Date(),
  });

  // Update status
  if (fee.paidAmount >= fee.amount) {
    fee.status = "PAID";
  } else if (fee.paidAmount > 0) {
    fee.status = "PARTIAL";
  }

  await fee.save();

  return NextResponse.json(fee);
}
