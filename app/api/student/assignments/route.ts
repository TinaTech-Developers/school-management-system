import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyStudent } from "@/lib/rbac";
import { Assignment } from "@/models/Assignment";

export async function GET(req: NextRequest) {
  const studentCheck = await verifyStudent(req);
  if (studentCheck instanceof NextResponse) return studentCheck;

  await connectDB();

  const url = new URL(req.url);
  const subjectId = url.searchParams.get("subjectId");

  let query: any = {};

  if (subjectId) query.subjectId = subjectId;

  const assignments = await Assignment.find(query)
    .populate("subjectId", "name className")
    .sort({ createdAt: -1 });

  return NextResponse.json(assignments);
}
