import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyAdmin } from "@/lib/rbac";
import { ClassSubject } from "@/models/ClassSubject";
import { ClassModel } from "@/models/Class";
import { Subject } from "@/models/Subject";
import { User } from "@/models/User";

/* ---------------- POST ---------------- */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  await connectDB();

  const adminCheck = await verifyAdmin(req);
  if (adminCheck instanceof NextResponse) return adminCheck;

  const { id: classId } = await context.params;

  const { subjectId, teacherId } = await req.json();

  if (!subjectId || !teacherId) {
    return NextResponse.json(
      { error: "subjectId and teacherId are required" },
      { status: 400 },
    );
  }

  const classExists = await ClassModel.findById(classId);
  if (!classExists) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const subject = await Subject.findById(subjectId);
  if (!subject) {
    return NextResponse.json({ error: "Subject not found" }, { status: 404 });
  }

  const teacher = await User.findById(teacherId);
  if (!teacher || teacher.role !== "TEACHER") {
    return NextResponse.json(
      { error: "Teacher not found or invalid role" },
      { status: 404 },
    );
  }

  try {
    const assignment = await ClassSubject.create({
      classId,
      subjectId,
      teacherId,
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json(
        {
          error:
            "This subject is already assigned to this class with this teacher",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ---------------- GET ---------------- */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  await connectDB();

  const { id: classId } = await context.params;

  const assignments = await ClassSubject.find({ classId })
    .populate("subjectId", "name")
    .populate("teacherId", "name email")
    .lean();

  return NextResponse.json(assignments);
}
