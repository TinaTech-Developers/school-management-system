import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Result } from "@/models/Result";
import { verifyTeacher, verifyAdmin } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  await connectDB();

  // Check if user is teacher/admin
  const teacher = await verifyTeacher(req);
  const admin = await verifyAdmin(req);
  const user = teacher instanceof NextResponse ? admin : teacher;
  if (user instanceof NextResponse) return user;

  try {
    // 1️⃣ Average score per exam
    const analytics = await Result.aggregate([
      {
        $group: {
          _id: "$examId",
          avgScore: { $avg: "$score" },
          total: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "exams",
          localField: "_id",
          foreignField: "_id",
          as: "exam",
        },
      },
      { $unwind: "$exam" },
      { $project: { exam: 1, avgScore: 1, total: 1 } },
    ]);

    // 2️⃣ Grade distribution
    const gradeDistribution = await Result.aggregate([
      {
        $group: {
          _id: "$grade",
          count: { $sum: 1 },
        },
      },
    ]);

    return NextResponse.json({ analytics, gradeDistribution });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
