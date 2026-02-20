import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Attendance } from "@/models/Attendance";
import { verifyTeacher } from "@/lib/rbac";

// Attendance status enum
type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

// ✅ GET attendance
// ✅ GET attendance (with optional date range)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Verify teacher
    const token = await verifyTeacher(req);
    if (token instanceof NextResponse) return token;

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const slotId = searchParams.get("slotId");
    const dateStr = searchParams.get("date"); // YYYY-MM-DD
    const dateFromStr = searchParams.get("dateFrom");
    const dateToStr = searchParams.get("dateTo");

    if (!classId || !slotId || (!dateStr && !dateFromStr && !dateToStr)) {
      return NextResponse.json(
        { error: "Missing classId, slotId, or date/date range" },
        { status: 400 },
      );
    }

    // Build query date range
    let dateQuery: any = {};
    if (dateStr) {
      const date = new Date(dateStr);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      dateQuery = { $gte: date, $lt: nextDay };
    } else if (dateFromStr || dateToStr) {
      const from = dateFromStr ? new Date(dateFromStr) : new Date(0); // start of epoch
      const to = dateToStr ? new Date(dateToStr) : new Date(); // default to today
      const nextDay = new Date(to);
      nextDay.setDate(to.getDate() + 1);
      dateQuery = { $gte: from, $lt: nextDay };
    }

    // Query attendance
    const records = await Attendance.find({
      classId: new mongoose.Types.ObjectId(classId),
      slotId: new mongoose.Types.ObjectId(slotId),
      date: dateQuery,
    })
      .populate("studentId", "name _id")
      .lean();

    return NextResponse.json({ success: true, records });
  } catch (err) {
    console.error("ATTENDANCE GET ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ✅ POST / mark attendance
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const token = await verifyTeacher(req);
    if (token instanceof NextResponse) return token;

    const body = await req.json();
    const { classId, slotId, date, attendance } = body;

    if (!classId || !slotId || !date || !attendance) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const lessonDate = new Date(date);

    const responses = [];

    for (const att of attendance) {
      // 🔒 Check if locked
      const existing = await Attendance.findOne({
        studentId: att.studentId,
        classId,
        slotId,
        date: lessonDate,
      });

      if (existing?.locked) {
        return NextResponse.json(
          { error: "Attendance is locked and cannot be edited" },
          { status: 403 },
        );
      }

      const record = await Attendance.findOneAndUpdate(
        {
          studentId: att.studentId,
          classId,
          slotId,
          date: lessonDate,
        },
        {
          status: att.status,
          remarks: att.remarks || "",
          markedBy: token.sub,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      );

      responses.push(record);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
