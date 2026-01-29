import { connectDB } from "@/lib/db";
import { Attendance } from "@/models/Attendance";
import { NextRequest, NextResponse } from "next/server";

type Params = { studentId: string };

export async function GET(
  req: NextRequest, // ✅ NextRequest, not Request
  { params }: { params: Promise<Params> },
) {
  await connectDB();
  const { studentId } = await params;

  const attendance = await Attendance.find({ studentId })
    .populate("timetableSlotId", "dayOfWeek startTime endTime")
    .populate("classId", "name")
    .sort({ date: -1 })
    .lean();

  return NextResponse.json(attendance);
}
