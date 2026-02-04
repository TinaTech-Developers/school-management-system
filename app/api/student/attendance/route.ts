import { connectDB } from "@/lib/db";
import { Attendance } from "@/models/Attendance";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  await connectDB();

  const user = await getAuthUser();
  if (!user || user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const attendance = await Attendance.find({
    studentId: user.sub,
  })
    .populate("timetableSlotId", "dayOfWeek startTime endTime")
    .populate("classId", "name")
    .sort({ date: -1 })
    .lean();

  return NextResponse.json(attendance);
}
