import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Result } from "@/models/Result";
import {
  verifyAdmin,
  verifyTeacher,
  verifyStudent,
  verifyParent,
} from "@/lib/rbac";
import { getGrade } from "@/lib/grading";

/* ================= GET RESULTS ================= */

export async function GET(req: Request) {
  await connectDB();

  // Try admin
  const admin = await verifyAdmin(req);
  if (!(admin instanceof NextResponse)) {
    return NextResponse.json(
      await Result.find()
        .populate("studentId", "name")
        .populate("examId", "name term year")
        .populate("examSubjectId", "name")
        .populate("enteredBy", "name")
        .populate("publishedBy", "name")
        .sort({ createdAt: -1 })
        .lean(),
    );
  }

  // Try teacher
  const teacher = await verifyTeacher(req);
  if (!(teacher instanceof NextResponse)) {
    return NextResponse.json(
      await Result.find()
        .populate("studentId", "name")
        .populate("examId", "name term year")
        .populate("examSubjectId", "name")
        .sort({ createdAt: -1 })
        .lean(),
    );
  }

  // Student / Parent → published only
  const student = await verifyStudent(req);
  if (!(student instanceof NextResponse)) {
    return NextResponse.json(
      await Result.find({
        studentId: student.sub,
        published: true,
      })
        .populate("examId", "name term year")
        .populate("examSubjectId", "name")
        .lean(),
    );
  }

  const parent = await verifyParent(req);
  if (!(parent instanceof NextResponse)) {
    return NextResponse.json(
      await Result.find({ published: true })
        .populate("studentId", "name")
        .populate("examId", "name term year")
        .populate("examSubjectId", "name")
        .lean(),
    );
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
}

/* ================= CREATE RESULT ================= */

export async function POST(req: Request) {
  await connectDB();

  const teacher = await verifyTeacher(req);
  const admin = await verifyAdmin(req);

  const user = teacher instanceof NextResponse ? admin : teacher;

  if (user instanceof NextResponse) return user;

  const { examId, examSubjectId, studentId, score, remarks } = await req.json();

  if (!examId || !examSubjectId || !studentId || score === undefined) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  try {
    const { grade, gpa } = getGrade(score);

    const result = await Result.create({
      examId,
      examSubjectId,
      studentId,
      score,
      grade,
      gpa,
      remarks,
      enteredBy: user.sub,
    });

    const populated = await Result.findById(result._id)
      .populate("studentId", "name")
      .populate("examId", "name term year")
      .populate("examSubjectId", "name")
      .populate("enteredBy", "name");

    return NextResponse.json(populated, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json(
        { error: "Result already exists for this student" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Failed to save result" },
      { status: 500 },
    );
  }
}
