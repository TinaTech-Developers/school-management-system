import { connectDB } from "@/lib/db";
import { ExamSubject } from "@/models/ExamSubject";
import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/rbac";

export async function GET() {
  await connectDB();

  const examSubjects = await ExamSubject.find()
    .populate("examId", "name term")
    .populate("classId", "name")
    .populate("subjectId", "name")
    .populate("teacherId", "name email")
    .lean();

  return NextResponse.json(examSubjects);
}

export async function POST(req: Request) {
  const forbidden = await verifyAdmin(req);
  if (forbidden instanceof NextResponse) return forbidden;

  const { examId, classId, subjectId, teacherId } = await req.json();

  if (!examId || !classId || !subjectId || !teacherId) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 },
    );
  }

  await connectDB();

  try {
    const examSubject = await ExamSubject.create({
      examId,
      classId,
      subjectId,
      teacherId,
    });

    return NextResponse.json(examSubject, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json(
        { error: "Exam subject already assigned" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
