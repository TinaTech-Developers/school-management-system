import { connectDB } from "@/lib/db";
import { Attendance } from "@/models/Attendance";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  await connectDB();

  const { id } = await context.params;

  const { searchParams } = req.nextUrl;
  const date = searchParams.get("date");

  const query: any = { classId: id };
  if (date) query.date = new Date(date);

  const attendance = await Attendance.find(query)
    .populate("studentId", "name")
    .populate("timetableSlotId", "subjectId startTime endTime")
    .lean();

  return NextResponse.json(attendance);
}
