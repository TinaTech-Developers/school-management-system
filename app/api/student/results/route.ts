// app/api/student/results/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Result } from "@/models/Result";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import "@/models/ExamSubject";
import "@/models/Exam";
import "@/models/Subject";

// GPA logic
function calculateGPA(score: number) {
  if (score >= 80) return 4.0;
  if (score >= 70) return 3.5;
  if (score >= 60) return 3.0;
  if (score >= 50) return 2.0;
  if (score >= 40) return 1.0;
  return 0.0;
}

export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = new mongoose.Types.ObjectId(session.user.id);

    // Disable strictPopulate to allow nested populate
    const results = await Result.find({ studentId })
      .populate({
        path: "examSubjectId",
        populate: {
          path: "subjectId",
          model: "Subject",
          select: "name _id",
        },
      })
      .populate({ path: "examId", select: "name term year" })
      .sort({ createdAt: -1 })
      .setOptions({ strictPopulate: false });

    const formatted = results.map((r) => {
      const score = r.score;
      const gpa = calculateGPA(score);

      return {
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
        score,
        gpa,
        published: r.published,
      };
    });

    console.log("RESULTS DEBUG:", formatted);

    return NextResponse.json({ results: formatted, total: formatted.length });
  } catch (err) {
    console.error("STUDENT RESULTS ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
