import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Attendance } from "@/models/Attendance";
import { verifyTeacher } from "@/lib/rbac";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const token = await verifyTeacher(req);
    if (token instanceof NextResponse) return token;

    const { classId, slotId, date } = await req.json();

    if (!classId || !slotId || !date) {
      return NextResponse.json(
        { error: "Missing classId, slotId, or date" },
        { status: 400 },
      );
    }

    const result = await Attendance.updateMany(
      {
        classId,
        slotId,
        date: new Date(date),
      },
      { locked: true },
    );

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("LOCK ATTENDANCE ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
