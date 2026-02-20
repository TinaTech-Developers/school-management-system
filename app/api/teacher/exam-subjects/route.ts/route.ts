import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { ExamSubject } from "@/models/ExamSubject";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const subjects = await ExamSubject.find({
    teacherId: session.user.id,
  })
    .populate("examId", "name term")
    .populate("classId", "name")
    .populate("subjectId", "name code");

  return NextResponse.json(subjects);
}
