import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { verifyAdmin } from "@/lib/rbac";
import bcrypt from "bcrypt";
import { Subject } from "@/models/Subject";
import { getAuthUser } from "@/lib/auth";

// GET all students
export async function GET(req: NextRequest) {
  await connectDB();

  const adminCheck = await verifyAdmin(req);
  if (adminCheck instanceof NextResponse) {
    return adminCheck; // ✅ only return NextResponse
  }

  const students = await User.find({ role: "STUDENT" }).lean();
  return NextResponse.json(students);
}

// POST create a new subject
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, classId, teacherId } = await req.json();

    const subject = await Subject.create({
      name,
      classId,
      teacherId,
      schoolId: user.schoolId,
    });

    return NextResponse.json(subject, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 },
    );
  }
}

// PATCH update a student
export async function PATCH(req: NextRequest) {
  await connectDB();

  const adminCheck = await verifyAdmin(req);
  if (adminCheck instanceof NextResponse) return adminCheck;

  const { id, ...updates } = await req.json();

  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password, 10);
  }

  const updated = await User.findByIdAndUpdate(id, updates, { new: true });
  if (!updated) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

// DELETE a student
export async function DELETE(req: NextRequest) {
  await connectDB();

  const adminCheck = await verifyAdmin(req);
  if (adminCheck instanceof NextResponse) return adminCheck;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Student ID is required" },
      { status: 400 },
    );
  }

  const deleted = await User.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Student deleted", student: deleted });
}
