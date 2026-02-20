import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Exam } from "@/models/Exam";
import { ExamSubject } from "@/models/ExamSubject";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 👇 Define proper context type
type RouteContext = {
  params: Promise<{ examId: string }>;
};

// ================= GET Exam Details =================
export async function GET(req: NextRequest, context: RouteContext) {
  await connectDB();

  const { examId } = await context.params; // ✅ unwrap promise

  const exam = await Exam.findById(examId);

  if (!exam) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }

  return NextResponse.json(exam);
}

// ================= POST Assign Subject =================
export async function POST(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { examId } = await context.params; // ✅ unwrap promise

  const { classId, subjectId, teacherId, totalMarks, passMarks } =
    await req.json();

  await connectDB();

  const examSubject = await ExamSubject.create({
    examId,
    classId,
    subjectId,
    teacherId,
    totalMarks,
    passMarks,
  });

  return NextResponse.json(examSubject);
}
