import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { User } from "@/models/User";
import { Assignment } from "@/models/Assignment";
import { Attendance } from "@/models/Attendance";
import { Fee } from "@/models/Fee";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const user = await getAuthUser();

  if (!user || user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const student = await User.findById(user.sub).lean();

  // ✅ IMPORTANT NULL GUARD
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  /* ======================
     CLASSES
  ====================== */
  const classesCount = student.classId ? 1 : 0;

  /* ======================
     ASSIGNMENTS
  ====================== */
  const assignmentsDue =
    student.classId ?
      await Assignment.countDocuments({
        classId: student.classId,
        dueDate: { $gte: new Date() },
      })
    : 0;

  /* ======================
     ATTENDANCE
  ====================== */
  const attendance = await Attendance.find({
    studentId: user.sub,
  }).lean();

  const attendancePct =
    attendance.length === 0 ?
      0
    : Math.round(
        (attendance.filter((a) => a.present).length / attendance.length) * 100,
      );

  /* ======================
     FEES
  ====================== */
  const fees = await Fee.find({
    studentId: user.sub,
    paid: false,
  }).lean();

  const outstandingFees = fees.reduce((sum, fee) => sum + fee.amount, 0);

  /* ======================
     RESPONSE
  ====================== */
  return NextResponse.json({
    classesCount,
    assignmentsDue,
    attendancePct,
    outstandingFees,
  });
}
