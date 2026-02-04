import { connectDB } from "@/lib/db";
import { TimetableSlot } from "@/models/TimeTableSlot";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import "@/models/Class";
import "@/models/Subject";
import "@/models/Room";
import "@/models/User";

const DAY_MAP: Record<string, string> = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
};

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = session.user;
    const classId = student.classId; // make sure the JWT/session has classId

    if (!classId) {
      return NextResponse.json(
        { error: "Student has no class assigned" },
        { status: 400 },
      );
    }

    const slots = await TimetableSlot.find({
      classId, // ✅ student’s class
    })
      .populate("subjectId", "name teacherId")
      .populate("roomId", "name")
      .lean();

    const formatted = slots.map((slot: any) => ({
      id: slot._id.toString(),
      day: DAY_MAP[slot.dayOfWeek] ?? slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      subject: slot.subjectId?.name ?? "—",
      teacher: slot.subjectId?.teacherId?.name ?? "—",
      room: slot.roomId?.name ?? "—",
      type: slot.type, // e.g., "CLASS" | "EXAM"
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET /student/timetable error:", error);
    return NextResponse.json(
      { error: "Failed to fetch timetable" },
      { status: 500 },
    );
  }
}
