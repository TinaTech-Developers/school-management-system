// list & create exams
import { connectDB } from "@/lib/db";
import { Exam } from "@/models/Exam";
import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/* -------------------- AUTH -------------------- */

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

/* -------------------- GET /api/exams -------------------- */
/* List all exams */

export async function GET(req: NextRequest) {
  await connectDB();

  const exams = await Exam.find().lean();
  return NextResponse.json(exams);
}

/* -------------------- POST /api/exams -------------------- */
/* Create exam (Admin only) */

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const data = await req.json();

  await connectDB();

  const exam = new Exam(data);
  await exam.save();

  return NextResponse.json(exam, { status: 201 });
}
