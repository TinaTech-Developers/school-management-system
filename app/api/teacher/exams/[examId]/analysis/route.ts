import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Result } from "@/models/Result";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  req: Request,
  context: { params: Promise<{ examId: string }> },
) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { examId } = await context.params;
    const objectId = new mongoose.Types.ObjectId(examId);

    // ===============================
    // FETCH RESULTS
    // ===============================
    const results = await Result.find({
      examId: objectId,
      enteredBy: session.user.id,
    }).populate("studentId", "name");

    if (!results.length) {
      return NextResponse.json({
        summary: {
          averageScore: 0,
          highest: 0,
          lowest: 0,
          totalStudents: 0,
          passRate: 0,
          topStudentName: "",
          topStudentScore: 0,
        },
        subjects: [],
        classes: [],
        topStudents: [],
        riskStudents: [],
        subjectAnalysis: [],
      });
    }

    // ===============================
    // SUMMARY
    // ===============================
    const marks = results.map((r) => r.score);
    const total = marks.reduce((a, b) => a + b, 0);

    const averageScore = total / marks.length;
    const highest = Math.max(...marks);
    const lowest = Math.min(...marks);

    const topStudent = results.reduce((top, r) =>
      r.score > top.score ? r : top,
    );

    const passRate = (marks.filter((m) => m >= 50).length / marks.length) * 100;

    // ===============================
    // SUBJECT PERFORMANCE
    // ===============================
    const subjectAnalysis = await Result.aggregate([
      {
        $match: {
          examId: objectId,
          enteredBy: new mongoose.Types.ObjectId(session.user.id),
        },
      },
      {
        $group: {
          _id: "$examSubjectId",
          average: { $avg: "$score" },
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "_id",
          foreignField: "_id",
          as: "subject",
        },
      },
      { $unwind: "$subject" },
      {
        $project: {
          name: "$subject.name",
          average: { $round: ["$average", 1] },
        },
      },
    ]);

    // ===============================
    // TOP STUDENTS
    // ===============================
    const topStudents = results
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((r) => ({
        name: r.studentId.name,
        average: r.score,
      }));

    const riskStudents = results
      .filter((r) => r.score < 50)
      .map((r) => ({
        name: r.studentId.name,
        average: r.score,
      }));

    return NextResponse.json({
      summary: {
        averageScore,
        highest,
        lowest,
        totalStudents: marks.length,
        passRate,
        topStudentName: topStudent.studentId.name,
        topStudentScore: topStudent.score,
      },
      subjects: subjectAnalysis,
      classes: [],
      topStudents,
      riskStudents,
      subjectAnalysis,
    });
  } catch (err) {
    console.error("ANALYSIS ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
