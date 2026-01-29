// Get all resultd for a student
import { connectDB } from "@/lib/db";
import { Result } from "@/models/Result";
import { NextRequest, NextResponse } from "next/server";

type Params = { studentId: String };

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Params> },
) {
  await connectDB();

  const { studentId } = await params;

  const results = await Result.find({ studentId })
    .populate("examId", "name date")
    .populate("subjectId", "name code")
    .lean();

  return NextResponse.json(results);
}
