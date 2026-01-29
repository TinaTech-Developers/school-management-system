import { connectDB } from "@/lib/db";
import { TimetableSlot } from "@/models/TimeTableSlot";
import { NextResponse } from "next/server";
import { verifyTeacher } from "@/lib/rbac";

// ✅ REGISTER MODELS FOR POPULATE
import "@/models/Class";
import "@/models/Subject";
import "@/models/Room";

export async function GET(req: Request) {
  const teacher = await verifyTeacher(req);
  if (teacher instanceof NextResponse) return teacher;

  await connectDB();

  const slots = await TimetableSlot.find({
    teacherId: teacher.sub, // JWT sub = ObjectId string ✔
  })
    .populate("classId", "name")
    .populate("subjectId", "name")
    .populate("roomId", "name")
    .sort({ dayOfWeek: 1, startTime: 1 })
    .lean();

  const formatted = slots.map((s: any) => ({
    id: s._id.toString(),
    day: s.dayOfWeek,
    startTime: s.startTime,
    endTime: s.endTime,
    subject: s.subjectId?.name ?? "—",
    className: s.classId?.name ?? "—",
    room: s.roomId?.name,
    type: s.type,
  }));

  return NextResponse.json(formatted);
}
