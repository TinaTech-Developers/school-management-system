import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ClassModel } from "@/models/Class";
import { User } from "@/models/User";
import "@/models/School"; // 🔥 just ensure it's loaded
import { verifyAdmin } from "@/lib/rbac";
import { Subject } from "@/models/Subject";
import { AuthToken } from "@/types/auth";

export async function GET(req: Request) {
  const auth = await verifyAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    await connectDB();

    const classes = await ClassModel.find()
      .populate("teacherId", "name email")
      .populate("schoolId", "name")
      .lean();

    return NextResponse.json(classes);
  } catch (err) {
    console.error("CLASSES GET ERROR:", err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  const auth = await verifyAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    await connectDB();

    const body = await req.json();
    const { name, schoolId, teacherId } = body;

    if (!name || !schoolId) {
      return NextResponse.json(
        { error: "Class name and school are required" },
        { status: 400 },
      );
    }

    const payload: any = {
      name,
      schoolId,
    };

    // ✅ ONLY add teacherId if it exists AND is not empty
    if (teacherId && teacherId !== "") {
      payload.teacherId = teacherId;
    }

    const newClass = await ClassModel.create(payload);

    return NextResponse.json(newClass, { status: 201 });
  } catch (err) {
    console.error("CLASS CREATE ERROR:", err);
    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 },
    );
  }
}
