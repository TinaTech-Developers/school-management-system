import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ExamResult } from "@/models/ExamResult";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { examSubjectId, studentId, marks } = await req.json();

  await connectDB();

  await ExamResult.updateOne(
    { examSubjectId, studentId },
    { examSubjectId, studentId, marks },
    { upsert: true }, // 🔒 prevents duplicates
  );

  return NextResponse.json({ success: true });
}
