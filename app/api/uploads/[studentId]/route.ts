import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Result } from "@/models/Result";
import {
  verifyStudent,
  verifyParent,
  verifyTeacher,
  verifyAdmin,
} from "@/lib/rbac";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ studentId: string }> },
) {
  await connectDB();

  const { studentId } = await context.params;

  // --------------------
  // 1️⃣ AUTHORIZATION
  // --------------------
  const studentToken = await verifyStudent(req).catch(() => new NextResponse());
  const parentToken = await verifyParent(req).catch(() => new NextResponse());
  const teacherToken = await verifyTeacher(req).catch(() => new NextResponse());
  const adminToken = await verifyAdmin(req).catch(() => new NextResponse());

  if (
    studentToken instanceof NextResponse &&
    parentToken instanceof NextResponse &&
    teacherToken instanceof NextResponse &&
    adminToken instanceof NextResponse
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // --------------------
  // 2️⃣ ACCESS CONTROL
  // --------------------
  if (
    !(studentToken instanceof NextResponse) &&
    studentToken.sub !== studentId
  ) {
    return NextResponse.json(
      { error: "Students can only view their own results" },
      { status: 403 },
    );
  }

  if (
    !(parentToken instanceof NextResponse) &&
    parentToken.childId !== studentId
  ) {
    return NextResponse.json(
      { error: "Parents can only view their child's results" },
      { status: 403 },
    );
  }

  // 👨‍🏫 Teacher → allowed (filtered later)
  // 🧑‍💼 Admin → full access

  // --------------------
  // 3️⃣ FETCH RESULTS
  // --------------------
  let query: any = { studentId };

  if (!(teacherToken instanceof NextResponse)) {
    query.createdBy = teacherToken.sub;
  }

  const results = await Result.find(query)
    .populate("examId", "name term year")
    .populate("subjectId", "name")
    .lean();

  return NextResponse.json(results);
}
