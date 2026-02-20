import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ExamResult } from "@/models/ExamResult";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// ✅ Correct context type
type RouteContext = {
  params: Promise<{ examId: string }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  await connectDB();

  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { examId } = await context.params; // ✅ unwrap promise

  const body = await req.json();
  const { examSubjectId, results } = body;

  const examObjectId = new mongoose.Types.ObjectId(examId);
  const subjectObjectId = new mongoose.Types.ObjectId(examSubjectId);

  const savedResults = await Promise.all(
    results.map(async (r: { studentId: string; marks: number }) => {
      const existing = await ExamResult.findOne({
        examId: examObjectId,
        examSubjectId: subjectObjectId,
        studentId: r.studentId,
      });

      if (existing) {
        existing.marks = r.marks;
        return existing.save();
      } else {
        return ExamResult.create({
          examId: examObjectId,
          examSubjectId: subjectObjectId,
          studentId: r.studentId,
          marks: r.marks,
          teacherId: session.user.id,
        });
      }
    }),
  );

  return NextResponse.json({ success: true, savedResults });
}
