import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Result } from "@/models/Result";
import { ExamSubject } from "@/models/ExamSubject";
import { verifyTeacher } from "@/lib/rbac";
import "@/models/Exam";
import "@/models/Subject";

// GPA calculation
function calculateGPA(score: number) {
  if (score >= 80) return 4.0;
  if (score >= 70) return 3.5;
  if (score >= 60) return 3.0;
  if (score >= 50) return 2.0;
  if (score >= 40) return 1.0;
  return 0.0;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Verify teacher token
    const token = await verifyTeacher(req);
    if (token instanceof NextResponse) return token;

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const subjectId = searchParams.get("subjectId");

    if (!studentId || !subjectId) {
      return NextResponse.json(
        { error: "Missing studentId or subjectId" },
        { status: 400 },
      );
    }

    const studentObjectId = new mongoose.Types.ObjectId(studentId);
    const subjectObjectId = new mongoose.Types.ObjectId(subjectId);
    const schoolObjectId = new mongoose.Types.ObjectId(token.schoolId);

    // Fetch all results for this student & school
    const results = await Result.find({
      studentId: studentObjectId,
      schoolId: schoolObjectId,
    })
      .populate({
        path: "examSubjectId",
        populate: { path: "subjectId", select: "name _id" },
      })
      .populate({ path: "examId", select: "name term year" })
      .sort({ createdAt: -1 })
      .setOptions({ strictPopulate: false });

    // Filter results by the specific subjectId
    const filtered = results.filter(
      (r) =>
        r.examSubjectId?.subjectId?._id.toString() ===
        subjectObjectId.toString(),
    );

    // Format results for frontend
    const formatted = filtered.map((r) => ({
      resultId: r._id,
      exam: {
        id: r.examId?._id,
        name: r.examId?.name,
        term: r.examId?.term,
        year: r.examId?.year,
      },
      subject: {
        id: r.examSubjectId?.subjectId?._id || null,
        name: r.examSubjectId?.subjectId?.name || "Unknown Subject",
      },
      score: r.score,
      gpa: calculateGPA(r.score),
      published: r.published,
    }));

    console.log("TEACHER RESULTS DEBUG:", formatted);

    return NextResponse.json({ success: true, results: formatted });
  } catch (err) {
    console.error("TEACHER RESULTS ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
