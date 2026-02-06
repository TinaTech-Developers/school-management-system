import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyStudent } from "@/lib/rbac";
import { Assignment } from "@/models/Assignment";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const studentCheck = await verifyStudent(req);
  if (studentCheck instanceof NextResponse) return studentCheck;

  await connectDB();

  // 🔥 NEXTJS 16 FIX
  const { id } = await context.params;

  const assignment = await Assignment.findById(id)
    .populate("subjectId", "name className")
    .lean();

  if (!assignment) {
    return NextResponse.json(
      { error: "Assignment not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(assignment);
}
