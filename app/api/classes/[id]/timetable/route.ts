import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { TimetableSlot } from "@/models/TimeTableSlot";
import { verifyAdmin } from "@/lib/rbac";
import mongoose from "mongoose";

/* ---------------- GET: Class Timetable ---------------- */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const adminCheck = await verifyAdmin(req);
    if (adminCheck instanceof NextResponse) return adminCheck;

    const { id: classId } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return NextResponse.json({ error: "Invalid class ID" }, { status: 400 });
    }

    const timetable = await TimetableSlot.find({ classId })
      .populate("subjectId", "name")
      .lean();

    return NextResponse.json(timetable);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ---------------- POST: Add Timetable Slot ---------------- */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const adminCheck = await verifyAdmin(req);
    if (adminCheck instanceof NextResponse) return adminCheck;

    const { id: classId } = await context.params;

    const { subjectId, teacherId, dayOfWeek, startTime, endTime, room } =
      await req.json();

    if (!subjectId || !teacherId || !dayOfWeek || !startTime || !endTime) {
      return NextResponse.json(
        { error: "All timetable fields are required" },
        { status: 400 },
      );
    }

    const slot = await TimetableSlot.create({
      classId,
      subjectId,
      teacherId,
      dayOfWeek,
      startTime,
      endTime,
      room,
    });

    return NextResponse.json(slot, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json(
        { error: "Time clash detected (class or teacher busy)" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
