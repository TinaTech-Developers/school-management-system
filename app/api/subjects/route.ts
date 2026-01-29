import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Subject } from "@/models/Subject";
import { verifyAdmin } from "@/lib/rbac";

export async function POST(req: Request) {
  const auth = await verifyAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    await connectDB();

    const { name, classId, teacherId, code, isCompulsory } = await req.json();

    if (!name || !classId || !teacherId || !code) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    // ✅ fully typed
    const subject = await Subject.create({
      name,
      classId,
      teacherId,
      code,
      isCompulsory,
      schoolId: auth.schoolId,
    });

    return NextResponse.json(subject, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  // const auth = await verifyAdmin(req);
  // if (auth instanceof NextResponse) return auth;

  try {
    await connectDB();
    const subjects = await Subject.find().lean();
    return NextResponse.json(subjects);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 },
    );
  }
}
