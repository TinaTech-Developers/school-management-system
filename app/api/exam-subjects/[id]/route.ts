import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ExamSubject } from "@/models/ExamSubject";
import { getToken } from "next-auth/jwt";

const SECRET = process.env.NEXTAUTH_SECRET!;

/* ---------------- ADMIN CHECK ---------------- */
async function requireAdmin(req: NextRequest) {
  const token = await getToken({ req, secret: SECRET });

  if (!token || token.role !== "ADMIN") {
    return NextResponse.json(
      { message: "Forbidden: Admins only" },
      { status: 403 },
    );
  }

  return null; // ✅ important
}

/* ---------------- GET: All Exam Subjects ---------------- */
export async function GET(req: NextRequest) {
  await connectDB();

  const examSubjects = await ExamSubject.find().lean();
  return NextResponse.json(examSubjects);
}

/* ---------------- POST: Add Exam Subject ---------------- */
export async function POST(req: NextRequest) {
  const forbidden = await requireAdmin(req);
  if (forbidden) return forbidden;

  await connectDB();

  const data = await req.json();
  const examSubject = await ExamSubject.create(data);

  return NextResponse.json(examSubject, { status: 201 });
}

/* ---------------- DELETE: Remove Exam Subject ---------------- */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const forbidden = await requireAdmin(req);
  if (forbidden) return forbidden;

  await connectDB();

  const { id } = await context.params;

  const deleted = await ExamSubject.findByIdAndDelete(id).lean();

  if (!deleted) {
    return NextResponse.json(
      { message: "Exam Subject not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(deleted);
}
