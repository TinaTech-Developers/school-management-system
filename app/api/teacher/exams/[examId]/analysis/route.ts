import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Result } from "@/models/Result";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ examId: string }> },
) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "TEACHER" || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { examId } = await params;

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return NextResponse.json({ error: "Invalid exam ID" }, { status: 400 });
    }

    const examObjectId = new mongoose.Types.ObjectId(examId);
    const teacherObjectId = new mongoose.Types.ObjectId(session.user.id);

    // ===============================
    // FETCH RESULTS
    // ===============================
    const results = await Result.find({
      examId: examObjectId,
      enteredBy: teacherObjectId,
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
      });
    }

    // ===============================
    // SUMMARY CALCULATION
    // ===============================
    const scores = results.map((r) => Number(r.score) || 0);

    const total = scores.reduce((a, b) => a + b, 0);
    const averageScore = total / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);

    const topStudent = results.reduce(
      (top, r) => (r.score > top.score ? r : top),
      results[0],
    );

    const passRate =
      (scores.filter((s) => s >= 50).length / scores.length) * 100;

    // ===============================
    // SUBJECT PERFORMANCE (AGGREGATION)
    // ===============================
    const subjects = await Result.aggregate([
      {
        $match: {
          examId: examObjectId,
          enteredBy: teacherObjectId,
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
      {
        $unwind: {
          path: "$subject",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: { $ifNull: ["$subject.name", "Unknown"] },
          average: {
            $round: [{ $ifNull: ["$average", 0] }, 1],
          },
        },
      },
    ]);

    // ===============================
    // TOP & RISK STUDENTS
    // ===============================
    const sortedResults = [...results].sort((a, b) => b.score - a.score);

    const topStudents = sortedResults.slice(0, 5).map((r) => ({
      name: r.studentId?.name || "Unknown",
      average: r.score,
    }));

    const riskStudents = results
      .filter((r) => r.score < 50)
      .map((r) => ({
        name: r.studentId?.name || "Unknown",
        average: r.score,
      }));

    // ===============================
    // RESPONSE
    // ===============================
    return NextResponse.json({
      summary: {
        averageScore,
        highest,
        lowest,
        totalStudents: scores.length,
        passRate,
        topStudentName: topStudent.studentId?.name || "Unknown",
        topStudentScore: topStudent.score,
      },
      subjects,
      classes: [],
      topStudents,
      riskStudents,
    });
  } catch (error) {
    console.error("ANALYSIS ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
