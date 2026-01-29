// GET all users
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/rbac";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  const admin = await verifyAdmin(req);
  if (admin instanceof NextResponse) return admin;

  try {
    await connectDB();
    const users = await User.find().lean();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

// POST add new user

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const {
    name,
    email,
    phone,
    password,
    role,
    schoolId,
    classId,
    parentId,
    subjects,
  } = body;

  if (!name || !email || !password || !role || !schoolId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  // ✅ Hash password before saving
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    email,
    phone,
    password: hashedPassword,
    role,
    schoolId,
  });

  if (role === "STUDENT") {
    if (classId) user.classId = classId;
    if (parentId && mongoose.Types.ObjectId.isValid(parentId))
      user.parentId = parentId;
  }

  if (role === "TEACHER" && subjects) user.subjects = subjects;

  await user.save();

  // 🔹 Auto-link student to parent
  if (role === "STUDENT" && parentId) {
    const parent = await User.findById(parentId);
    if (parent && parent.role === "PARENT") {
      parent.childrenIds = parent.childrenIds || [];
      if (!parent.childrenIds.includes(user._id))
        parent.childrenIds.push(user._id);
      await parent.save();
    }
  }

  return NextResponse.json(user, { status: 201 });
}
