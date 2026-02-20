import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { ExamSubject } from "@/models/ExamSubject";
import { Student } from "@/models/Student";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ examId: string }> },
) {
  await connectDB();

  const { examId } = await params;

  const url = new URL(req.url);
  const subjectId = url.searchParams.get("subjectId");

  if (!subjectId) {
    return NextResponse.json([]);
  }

  // STEP 1: Find ExamSubject
  const examSubject = await ExamSubject.findOne({
    examId: new mongoose.Types.ObjectId(examId),
    subjectId: new mongoose.Types.ObjectId(subjectId),
  });

  if (!examSubject) {
    return NextResponse.json([]);
  }

  // STEP 2: Get students from class
  const students = await Student.find({
    classId: examSubject.classId,
  }).select("name");

  return NextResponse.json(students);
}
