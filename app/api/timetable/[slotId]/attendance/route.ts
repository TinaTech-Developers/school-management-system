import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Attendance } from "@/models/Attendance";
import { TimetableSlot } from "@/models/TimeTableSlot";
import { verifyTeacher } from "@/lib/rbac";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slotId: string }> },
) {
  await connectDB();

  const { slotId } = await context.params;

  // ✅ Teacher only
  const teacherToken = await verifyTeacher(req);
  if (teacherToken instanceof NextResponse) return teacherToken;

  const { date, records } = await req.json();

  if (!date || !Array.isArray(records)) {
    return NextResponse.json(
      { error: "Date and attendance records are required" },
      { status: 400 },
    );
  }

  const slot = await TimetableSlot.findById(slotId);
  if (!slot) {
    return NextResponse.json(
      { error: "Timetable slot not found" },
      { status: 404 },
    );
  }

  // Ensure teacher owns this lesson
  if (slot.teacherId.toString() !== teacherToken.sub) {
    return NextResponse.json(
      { error: "Unauthorized to mark this class" },
      { status: 403 },
    );
  }

  const attendanceDocs = records.map((r: any) => ({
    studentId: r.studentId,
    classId: slot.classId,
    timetableSlotId: slotId,
    date: new Date(date),
    status: r.status,
    remarks: r.remarks || "",
    markedBy: teacherToken.sub,
  }));

  try {
    await Attendance.insertMany(attendanceDocs, { ordered: false });
    return NextResponse.json({ message: "Attendance saved successfully" });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Some attendance records already exist" },
      { status: 409 },
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slotId: string }> },
) {
  await connectDB();
  const { slotId } = await context.params;

  const attendance = await Attendance.find({
    timetableSlotId: slotId,
  })
    .populate("studentId", "name")
    .lean();

  return NextResponse.json(attendance);
}
