import { connectDB } from "@/lib/db";
import { TimetableSlot } from "@/models/TimeTableSlot";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import "@/models/Class";
import "@/models/Subject";
import "@/models/Room";

// ✅ REGISTER MODELS FOR POPULATE
import "@/models/Class";
import "@/models/Subject";
import "@/models/Room";

const DAY_MAP: Record<string, string> = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
};

export async function GET(req: NextRequest) {
  await connectDB();

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || token.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slots = await TimetableSlot.find({
    teacherId: token.sub, // ✅ CORRECT
  })
    .populate("classId", "name")
    .populate("subjectId", "name")
    .populate("roomId", "name")
    .sort({ dayOfWeek: 1, startTime: 1 })
    .lean();

  const formatted = slots.map((slot: any) => ({
    id: slot._id.toString(),
    day: DAY_MAP[slot.dayOfWeek],
    startTime: slot.startTime,
    endTime: slot.endTime,
    subject: slot.subjectId?.name ?? "—",
    className: slot.classId?.name ?? "—",
    room: slot.roomId?.name,
    type: slot.type,
  }));

  return NextResponse.json(formatted);
}
