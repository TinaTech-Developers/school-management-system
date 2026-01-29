import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { TimetableSlot } from "@/models/TimeTableSlot";
import "@/models/Subject";
import "@/models/Class";
import "@/models/User";
import "@/models/Room";

export async function POST(req: Request) {
  try {
    await connectDB();

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

    /* ================= CREATE SLOT ================= */

    const slot = await TimetableSlot.create({
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
    });

    return NextResponse.json(slot, { status: 201 });
  } catch (err: any) {
    console.error("TIMETABLE CREATE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create timetable slot" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const slots = await TimetableSlot.find().populate(
      "classId subjectId teacherId roomId",
    );
    return NextResponse.json(slots);
  } catch (err: any) {
    console.error("TIMETABLE FETCH ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch timetable slots" },
      { status: 500 },
    );
  }
}
