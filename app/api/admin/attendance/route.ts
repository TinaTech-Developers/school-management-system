import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Attendance } from "@/models/Attendance";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import "@/models/Class";
import "@/models/TimeTableSlot";
import { authOptions } from "../../auth/[...nextauth]/route";

interface AttendancePayload {
  studentId: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  slotId: string;
  date: string;
  remarks?: string;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // ✅ Get session correctly
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const body = await req.json();
    const {
      classId,
      records,
    }: { classId: string; records: AttendancePayload[] } = body;

    if (!classId || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: "Missing classId or records" },
        { status: 400 },
      );
    }

    // ✅ Validate students belong to this class
    const studentIds = records.map((r) => r.studentId);

    const validStudents = await User.find({
      _id: { $in: studentIds },
      role: "STUDENT",
      classId,
    }).select("_id");

    const validIds = new Set(validStudents.map((s) => s._id.toString()));

    // ✅ Loop correctly through records
    for (const record of records) {
      if (!validIds.has(record.studentId)) continue;

      const lessonDate = new Date(record.date);

      await Attendance.findOneAndUpdate(
        {
          studentId: record.studentId,
          classId,
          slotId: record.slotId,
          date: lessonDate,
        },
        {
          status: record.status,
          remarks: record.remarks || "",
          markedBy: userId,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      );
    }

    return NextResponse.json({
      success: true,
      count: records.length,
    });
  } catch (err) {
    console.error("ATTENDANCE ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
