// Publish exam results
import { connectDB } from "@/lib/db";
import { verifyAdmin } from "@/lib/rbac";
import { Exam } from "@/models/Exam";
import { NextResponse, NextRequest } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ examId: string }> },
) {
  const { examId } = await params;

  const token = await verifyAdmin(req);
  if (!token) {
    return NextResponse.json(
      { message: "Forbidden: Access is denied." },
      { status: 403 },
    );
  }

  await connectDB();

  const exam = await Exam.findById(examId);
  if (!exam) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }

  exam.isPublished = true;
  await exam.save();

  return NextResponse.json({ success: true, exam });
}
