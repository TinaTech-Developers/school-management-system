import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    await connectDB();

    const email = "admin@tinisoftnexus.co.zw";
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { message: "Admin already exists" },
        { status: 200 }
      );
    }

    const hashed = await bcrypt.hash("admin123", 10);

    const admin = await User.create({
      name: "TinaSoft Admin",
      email,
      password: hashed,
      role: "ADMIN",
      schoolId: "tinasoftnexus-id", // must exist in your School collection
    });

    return NextResponse.json(
      { message: "Admin created", admin },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Error creating admin", error: err },
      { status: 500 }
    );
  }
}
