// app/api/admin/assign-student-to-class/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyAdmin } from "@/lib/rbac";
import { User } from "@/models/User";
import { ClassModel } from "@/models/Class";

export async function POST(req: Request) {
  await connectDB();

  const adminCheck = await verifyAdmin(req);
  if (adminCheck instanceof NextResponse) return adminCheck;

  const { studentId, classId } = await req.json();

  if (!studentId || !classId) {
    return NextResponse.json(
      { error: "studentId and classId are required" },
      { status: 400 }
    );
  }

  const student = await User.findById(studentId);
  if (!student || student.role !== "STUDENT") {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const classExists = await ClassModel.findById(classId);
  if (!classExists) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  student.classId = classId;
  await student.save();

  return NextResponse.json({
    message: "Student assigned to class successfully",
  });
}
