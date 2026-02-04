// app/api/student/fees/me/route.ts
import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Fee } from "@/models/Fee";
import { verifyStudent } from "@/lib/rbac";
import "@/models/Class"; // ensure models are loaded

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // ✅ Verify student token
    const studentToken = await verifyStudent(req);
    if (studentToken instanceof NextResponse) return studentToken;

    const studentId = studentToken.sub; // Logged-in student's ID

    // ✅ Fetch fees for this student only
    const fees = await Fee.find({ studentId })
      .populate("classId", "name")
      .lean();

    // ✅ Format for frontend
    const formatted = fees.map((fee) => ({
      _id: fee._id.toString(),
      type: fee.type,
      amount: fee.amount,
      paidAmount: fee.paidAmount,
      status: fee.status,
      dueDate: fee.dueDate,
      paymentHistory: fee.paymentHistory || [],
      className: fee.classId?.name ?? "—",
    }));

    return NextResponse.json(formatted);
  } catch (err: any) {
    console.error("Failed to fetch student fees:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
