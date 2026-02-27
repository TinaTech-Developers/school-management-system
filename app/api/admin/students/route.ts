// app/api/admin/students/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import "@/models/Class"; // Make sure Class model is registered

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const classId = req.nextUrl.searchParams.get("classId");
    if (!classId) {
      return NextResponse.json(
        { error: "Missing classId parameter" },
        { status: 400 },
      );
    }

    // Fetch students in this class
    const students = await User.find({ role: "STUDENT", classId })
      .select("_id name email phone classId")
      .populate("classId", "name") // populate class name
      .sort({ name: 1 });

    const formatted = students.map((s) => ({
      _id: s._id,
      name: s.name,
      email: s.email,
      phone: s.phone || null,
      className: (s.classId as any)?.name || null,
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
