import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Subject } from "@/models/Subject";
import { User } from "@/models/User";
import { verifyAdmin } from "@/lib/rbac";

// GET a single subject
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await context.params;

    const subject = await Subject.findById(id)
      .populate("teacherId")
      .populate("schoolId");

    if (!subject) {
      return NextResponse.json(
        { message: "Subject not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(subject);
  } catch (err: any) {
    console.error("GET /api/subjects/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT: update a subject
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  await connectDB();

  const adminCheck = await verifyAdmin(req);
  if (adminCheck instanceof NextResponse) return adminCheck;

  const { id } = await context.params;
  const { name, schoolId, teacherId } = await req.json();

  const subject = await Subject.findById(id);
  if (!subject) {
    return NextResponse.json({ error: "Subject not found." }, { status: 404 });
  }

  if (name) subject.name = name;
  if (schoolId) subject.schoolId = schoolId;

  if (teacherId) {
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Teacher not found or invalid role." },
        { status: 404 },
      );
    }
    subject.teacherId = teacherId;
  }

  await subject.save();
  return NextResponse.json(subject);
}

// PATCH: partial update
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  await connectDB();

  const admin = await verifyAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { id } = await context.params;
  const updates = await req.json();

  const subject = await Subject.findByIdAndUpdate(id, updates, { new: true });
  if (!subject) {
    return NextResponse.json({ message: "Subject not found" }, { status: 404 });
  }

  return NextResponse.json(subject);
}

// DELETE a subject
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  await connectDB();

  const adminCheck = await verifyAdmin(req);
  if (adminCheck instanceof NextResponse) return adminCheck;

  const { id } = await context.params;

  const subject = await Subject.findByIdAndDelete(id);
  if (!subject) {
    return NextResponse.json({ error: "Subject not found." }, { status: 404 });
  }

  return NextResponse.json({ message: "Subject deleted successfully." });
}
