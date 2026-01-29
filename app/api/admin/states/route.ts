import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { ClassModel } from "@/models/Class";
import { Subject } from "@/models/Subject";
import { Exam } from "@/models/Exam";
import { Result } from "@/models/Result";
import { Fee } from "@/models/Fee";
import { verifyAdmin } from "@/lib/rbac";

export async function GET(req: Request) {
  // Only admins can access
  const admin = await verifyAdmin(req);
  if (admin instanceof NextResponse) return admin;

  await connectDB();

  const usersCount = await User.countDocuments();
  const classesCount = await ClassModel.countDocuments();
  const subjectsCount = await Subject.countDocuments();
  const examsCount = await Exam.countDocuments();
  const resultsCount = await Result.countDocuments();
  const feesPending = await Fee.countDocuments({ status: { $ne: "PAID" } });

  // Optional: recent activities
  const recentActivities = [
    {
      message: "Student John Doe was assigned to Grade 10A.",
      time: new Date().toISOString(),
    },
    {
      message: "Maths Exam scheduled for Term 1.",
      time: new Date().toISOString(),
    },
    {
      message: "Fees payment received from Parent Jane Smith.",
      time: new Date().toISOString(),
    },
    {
      message: "Teacher Mike assigned to Physics for Grade 11B.",
      time: new Date().toISOString(),
    },
  ];

  return NextResponse.json({
    stats: {
      users: usersCount,
      classes: classesCount,
      subjects: subjectsCount,
      exams: examsCount,
      results: resultsCount,
      feesPending,
    },
    activities: recentActivities,
  });
}
