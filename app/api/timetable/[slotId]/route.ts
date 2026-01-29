import { NextRequest, NextResponse } from "next/server";
import { TimetableSlot } from "@/models/TimeTableSlot";
import { connectDB } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ slotId: string }> },
) {
  try {
    await connectDB();

    const { slotId } = await context.params;

    const {
      classId,
      subjectId,
      teacherId,
      roomId,
      dayOfWeek,
      startTime,
      endTime,
      academicYear,
      term,
      type,
    } = await req.json();

    /* ================= CONFLICT CHECK ================= */

    const conflict = await TimetableSlot.findOne({
      _id: { $ne: slotId },
      academicYear,
      term,
      dayOfWeek,
      $or: [{ classId }, { teacherId }, ...(roomId ? [{ roomId }] : [])],
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (conflict) {
      return NextResponse.json(
        { error: "Timetable conflict detected" },
        { status: 409 },
      );
    }

    /* ================= UPDATE SLOT ================= */

    const updated = await TimetableSlot.findByIdAndUpdate(
      slotId,
      {
        classId,
        subjectId,
        teacherId,
        roomId,
        dayOfWeek,
        startTime,
        endTime,
        academicYear,
        term,
        type,
      },
      { new: true },
    );

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("TIMETABLE UPDATE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update timetable slot" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ slotId: string }> },
) {
  try {
    await connectDB();

    const { slotId } = await context.params;

    await TimetableSlot.findByIdAndDelete(slotId);

    return NextResponse.json(
      { message: "Timetable slot deleted successfully" },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("TIMETABLE DELETE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete timetable slot" },
      { status: 500 },
    );
  }
}
