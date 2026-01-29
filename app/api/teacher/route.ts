import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { verifyTeacher } from "@/lib/rbac";

// Only ADMIN can create, update, delete teachers

export async function GET() {
  await connectDB();
  const teachers = await User.find({ role: "TEACHER" }).lean();
  return NextResponse.json(teachers);
}

export async function POST(req: NextRequest) {
  await connectDB();

  // Admin check
  const teacherCheck = await verifyTeacher(req);
  if (teacherCheck instanceof NextResponse) {
    return teacherCheck;
  }

  const { name, email, password, schoolId } = await req.json();

  if (!name || !email || !password || !schoolId) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 },
    );
  }

  // Check if email exists
  const exists = await User.findOne({ email });
  if (exists)
    return NextResponse.json(
      { error: "Email already exists" },
      { status: 400 },
    );

  // Hash password
  const bcrypt = (await import("bcrypt")).default;
  const hashed = await bcrypt.hash(password, 10);

  const newTeacher = await User.create({
    name,
    email,
    password: hashed,
    role: "TEACHER",
    schoolId,
  });

  return NextResponse.json(newTeacher, { status: 201 });
}
