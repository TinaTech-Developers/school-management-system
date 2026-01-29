import { connectDB } from "@/lib/db";
import { Attendance } from "@/models/Attendance";
import { TimetableSlot } from "@/models/TimeTableSlot";
import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  await connectDB();

  const token = await getToken({ req });
  if (!token || token.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slotId, records } = await req.json();

  const slot = await TimetableSlot.findById(slotId);
  if (!slot) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const ops = records.map((r: any) => ({
    updateOne: {
      filter: {
        slotId,
        studentId: r.studentId,
        date: today,
      },
      update: {
        $set: {
          classId: slot.classId,
          teacherId: token.sub,
          status: r.status,
        },
      },
      upsert: true,
    },
  }));

  await Attendance.bulkWrite(ops);

  return NextResponse.json({ success: true });
}
