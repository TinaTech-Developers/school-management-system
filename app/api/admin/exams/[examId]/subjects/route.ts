import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { ExamSubject } from "@/models/ExamSubject";
import mongoose from "mongoose";

// ✅ Proper context type for Next 16
type RouteContext = {
  params: Promise<{ examId: string }>;
};

// ================= POST =================
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { examId } = await context.params; // ✅ unwrap promise

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return NextResponse.json({ error: "Invalid examId" }, { status: 400 });
    }

    const { subjects } = await req.json();

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return NextResponse.json(
        { error: "No subjects provided" },
        { status: 400 },
      );
    }

    await connectDB();

    const bulkOps = subjects.map((s: any) => ({
      updateOne: {
        filter: {
          examId: new mongoose.Types.ObjectId(examId),
          classId: s.classId,
          subjectId: s.subjectId,
          teacherId: s.teacherId,
        },
        update: {
          examId: new mongoose.Types.ObjectId(examId),
          classId: s.classId,
          subjectId: s.subjectId,
          teacherId: s.teacherId,
          totalMarks: s.totalMarks ?? 100,
          passMarks: s.passMark ?? 40,
        },
        upsert: true,
      },
    }));

    await ExamSubject.bulkWrite(bulkOps);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST subjects error:", error);

    return NextResponse.json(
      { error: "Failed to assign subjects" },
      { status: 500 },
    );
  }
}

// ================= GET =================
export async function GET(req: NextRequest, context: RouteContext) {
  await connectDB();

  const { examId } = await context.params; // ✅ unwrap promise

  const subjects = await ExamSubject.find({ examId })
    .populate("classId", "name")
    .populate("subjectId", "name")
    .populate("teacherId", "name");

  const result = subjects.map((s: any) => ({
    _id: s._id,
    className: s.classId.name,
    subjectName: s.subjectId.name,
    teacherName: s.teacherId.name,
    totalMarks: s.totalMarks,
    passMarks: s.passMarks,
  }));

  return NextResponse.json(result);
}
