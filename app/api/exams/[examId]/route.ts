// get / update / delete exam by Id
import { connectDB } from "@/lib/db";
import { Exam } from "@/models/Exam";
import { Result } from "@/models/Result";
import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/* -------------------- AUTH HELPERS -------------------- */

async function verifyAdmin(req: NextRequest) {
  const token = await getToken({ req });

  if (!token || token.role !== "ADMIN") {
    return NextResponse.json(
      { message: "Forbidden: Admin access required." },
      { status: 403 },
    );
  }

  return token;
}

async function verifyTeacher(req: NextRequest) {
  const token = await getToken({ req });

  if (!token || (token.role !== "TEACHER" && token.role !== "ADMIN")) {
    return NextResponse.json(
      { message: "Forbidden: Teacher access required." },
      { status: 403 },
    );
  }

  return token;
}

type Params = { examId: string };

/* -------------------- GET (Teacher/Admin) -------------------- */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Params> },
) {
  const { examId } = await params;

  const teacher = await verifyTeacher(req);
  if (teacher instanceof NextResponse) return teacher;

  await connectDB();

  const exam = await Exam.findById(examId);
  if (!exam) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }

  return NextResponse.json(exam);
}

/* -------------------- DELETE (Admin only) -------------------- */

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<Params> },
) {
  const { examId } = await params;

  const admin = await verifyAdmin(req);
  if (admin instanceof NextResponse) return admin;

  await connectDB();

  const hasResults = await Result.exists({ examId });
  if (hasResults) {
    return NextResponse.json(
      { error: "Cannot delete exam with recorded results" },
      { status: 400 },
    );
  }

  const deleted = await Exam.findByIdAndDelete(examId);
  if (!deleted) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

/* -------------------- PUT (Teacher/Admin) -------------------- */

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<Params> },
) {
  const { examId } = await params;

  const teacher = await verifyTeacher(req);
  if (teacher instanceof NextResponse) return teacher;

  const data = await req.json();

  await connectDB();

  const updatedExam = await Exam.findByIdAndUpdate(examId, data, {
    new: true,
  }).lean();

  if (!updatedExam) {
    return NextResponse.json({ message: "Exam not found." }, { status: 404 });
  }

  return NextResponse.json(updatedExam);
}
