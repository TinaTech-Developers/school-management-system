import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { TimetableSlot } from "@/models/TimeTableSlot";
import { NextRequest, NextResponse } from "next/server";

type Params = { studentId: string };

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Params> },
) {
  await connectDB();

  const { studentId } = await params;
  const student = await User.findById(studentId).lean();
  if (!student || !student.classId) {
    return NextResponse.json(
      { error: "Student or class not found" },
      { status: 404 },
    );
  }

  const timetable = await TimetableSlot.find({
    classId: student.classId,
  })
    .populate("subjectId", "name")
    .populate("teacherId", "name")
    .sort({ dayOfWeek: 1, startTime: 1 })
    .lean();

  return NextResponse.json(timetable);
}
