// app/api/teacher/students/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { verifyTeacher } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  await connectDB();

  const token = await verifyTeacher(req);
  if (token instanceof NextResponse) return token;

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");
  const subjectId = searchParams.get("subjectId");

  if (!classId || !subjectId) {
    return NextResponse.json(
      { error: "Missing classId or subjectId" },
      { status: 400 },
    );
  }

  const students = await User.find({
    role: "STUDENT",
    classId: new mongoose.Types.ObjectId(classId),
    subjects: subjectId, // assuming student.subjects is an array
    schoolId: token.schoolId,
  }).select("_id name email");

  return NextResponse.json({ success: true, students });
}
