import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Exam } from "@/models/Exam";
import { ExamSubject } from "@/models/ExamSubject";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find all subjects the teacher teaches
  const subjects = await ExamSubject.find({
    teacherId: session.user.id,
  }).select("examId");

  const examIds = subjects.map((s) => s.examId);

  // Get distinct exams
  const exams = await Exam.find({ _id: { $in: examIds } }).sort({
    startDate: -1,
  });

  return NextResponse.json(exams);
}
