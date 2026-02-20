import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { Exam } from "@/models/Exam";

/* =========================
   POST: Create Exam (ADMIN)
========================= */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 1️⃣ Auth check
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ School check
    if (!session.user.schoolId) {
      return NextResponse.json(
        { error: "Admin has no school assigned" },
        { status: 400 },
      );
    }

    const { name, term, startDate, endDate } = await req.json();

    if (!name || !term) {
      return NextResponse.json(
        { error: "Name and term are required" },
        { status: 400 },
      );
    }

    await connectDB();

    // ✅ IMPORTANT: DO NOT USE `new Exam(data)`
    const exam = await Exam.create({
      name,
      term,
      startDate,
      endDate,
      schoolId: session.user.schoolId, // ✅ FIX
      createdBy: session.user.id,
      isPublished: false,
    });

    return NextResponse.json(exam, { status: 201 });
  } catch (error) {
    console.error("POST /api/exams error:", error);
    return NextResponse.json(
      { error: "Failed to create exam" },
      { status: 500 },
    );
  }
}

/* =========================
   GET: Admin Exams
========================= */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not admin" }, { status: 403 });
    }

    if (!session.user.schoolId) {
      return NextResponse.json(
        { error: "Admin has no schoolId" },
        { status: 400 },
      );
    }

    await connectDB();

    const exams = await Exam.find({
      schoolId: session.user.schoolId,
    })
      .sort({ createdAt: -1 })
      .select("_id name term startDate endDate");

    return NextResponse.json(exams);
  } catch (err) {
    console.error("GET /api/admin/exams error:", err);
    return NextResponse.json(
      { error: "Failed to fetch exams" },
      { status: 500 },
    );
  }
}
