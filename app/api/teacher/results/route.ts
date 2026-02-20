// app/api/teacher/results/route.ts
import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyTeacher } from "@/lib/rbac";
import { Result } from "@/models/Result";
import { ExamSubject } from "@/models/ExamSubject";
import { User } from "@/models/User";

// ---------------- GET: List Results by Teacher's Subjects ----------------
export async function GET(req: NextRequest) {
  const teacherCheck = await verifyTeacher(req);
  if (teacherCheck instanceof NextResponse) return teacherCheck;

  const token = teacherCheck;
  await connectDB();

  const url = new URL(req.url);
  const subjectId = url.searchParams.get("subjectId");

  // Fetch the subjects that this teacher teaches
  const teacherSubjects = await ExamSubject.find({ teacherId: token.sub });

  // Filter by subject if provided, otherwise return all teacher's subjects
  const filter: any = {};
  if (subjectId) {
    // Validate subject belongs to teacher
    if (!teacherSubjects.some((s) => s._id.toString() === subjectId)) {
      return NextResponse.json(
        { error: "Unauthorized for this subject" },
        { status: 403 },
      );
    }
    filter.examSubjectId = subjectId;
  } else {
    filter.examSubjectId = { $in: teacherSubjects.map((s) => s._id) };
  }

  const results = await Result.find(filter)
    .populate("studentId", "name email")
    .populate("examSubjectId", "name")
    .populate("enteredBy", "name")
    .populate("publishedBy", "name")
    .sort({ createdAt: -1 });

  // Map results to a simpler object
  const mapped = results.map((r) => ({
    _id: r._id,
    studentId: r.studentId,
    examSubjectId: r.examSubjectId,
    score: r.score,
    grade: r.grade,
    gpa: r.gpa,
    remarks: r.remarks,
    published: r.published,
    publishedAt: r.publishedAt,
    enteredBy: r.enteredBy?.name || "Unknown",
    publishedBy: r.publishedBy?.name || null,
    createdAt: r.createdAt.toISOString(),
  }));

  return NextResponse.json(mapped);
}

// ---------------- POST: Add Result ----------------
export async function POST(req: NextRequest) {
  const teacherCheck = await verifyTeacher(req);
  if (teacherCheck instanceof NextResponse) return teacherCheck;

  const token = teacherCheck;
  await connectDB();

  const body = await req.json();
  const { examSubjectId, studentId, score, grade, gpa, remarks } = body;

  if (!examSubjectId || !studentId || score === undefined) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  // Ensure teacher teaches this subject
  const subject = await ExamSubject.findOne({
    _id: examSubjectId,
    teacherId: token.sub,
  });
  if (!subject) {
    return NextResponse.json(
      { error: "Unauthorized for this subject" },
      { status: 403 },
    );
  }

  // Ensure student exists
  const student = await User.findById(studentId);
  if (!student || student.role !== "STUDENT") {
    return NextResponse.json({ error: "Invalid student" }, { status: 400 });
  }

  try {
    const newResult = await Result.create({
      examSubjectId,
      studentId,
      score,
      grade,
      gpa,
      remarks,
      enteredBy: token.sub,
    });

    return NextResponse.json(
      {
        ...newResult.toObject(),
        enteredBy: (token as any)?.name || "You",
      },
      { status: 201 },
    );
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json(
        { error: "Result for this student and subject already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: err.message || "Failed to add result" },
      { status: 500 },
    );
  }
}
