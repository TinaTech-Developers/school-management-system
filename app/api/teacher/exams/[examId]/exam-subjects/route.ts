import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { verifyTeacher } from "@/lib/rbac";
import { ExamSubject } from "@/models/ExamSubject";
import "@/models/Subject";
import "@/models/Exam";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ examId: string }> },
) {
  try {
    await connectDB();

    // ✅ unwrap params (Next 16 format)
    const { examId } = await context.params;

    if (!examId || !mongoose.Types.ObjectId.isValid(examId)) {
      return NextResponse.json({ error: "Invalid exam ID" }, { status: 400 });
    }

    // ✅ Verify teacher
    const teacher = await verifyTeacher(req);
    if (teacher instanceof NextResponse) {
      return teacher;
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
      return NextResponse.json(
        { error: "Valid classId is required" },
        { status: 400 },
      );
    }

    // ✅ Find exam subjects
    const examSubjects = await ExamSubject.find({
      examId,
      classId,
    })
      .populate({
        path: "subjectId",
        select: "name",
      })
      .lean();

    // ✅ Format response cleanly
    const formatted = examSubjects.map((es) => ({
      _id: es._id,
      subject: {
        _id: es.subjectId?._id || null,
        name: es.subjectId?.name || "Unknown Subject",
      },
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("EXAM SUBJECT FETCH ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
