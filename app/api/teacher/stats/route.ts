import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { TimetableSlot } from "@/models/TimeTableSlot";
import { User } from "@/models/User";
import { Result } from "@/models/Result";
import { Attendance } from "@/models/Attendance";
import { verifyTeacher } from "@/lib/rbac";

export async function GET(req: Request) {
  await connectDB();

  const teacher = await verifyTeacher(req);
  if (teacher instanceof NextResponse) return teacher;

  // Count classes assigned
  const classes = await TimetableSlot.distinct("classId", {
    teacherId: teacher.sub,
  });

  // Count students
  const students = await User.countDocuments({
    classId: { $in: classes },
    role: "STUDENT",
  });

  // Count exams for teacher's classes
  const results = await Result.find({
    studentId: {
      $in: await User.find({ classId: { $in: classes } }).distinct("_id"),
    },
  });
  const exams = new Set(results.map((r) => r.examId.toString())).size;

  // Attendance pending (today)
  const attendancePending = await TimetableSlot.countDocuments({
    teacherId: teacher.sub,
    dayOfWeek: new Date()
      .toLocaleString("en-US", { weekday: "short" })
      .toUpperCase(),
    _id: {
      $nin: await Attendance.find({
        markedBy: teacher.sub,
        date: new Date(),
      }).distinct("timetableSlotId"),
    },
  });

  // Results pending
  const studentsInClasses = await User.find({
    classId: { $in: classes },
  }).distinct("_id");
  const resultsPending = await Result.countDocuments({
    studentId: { $in: studentsInClasses },
    enteredBy: { $ne: teacher.sub },
  });

  return NextResponse.json({
    classes: classes.length,
    students,
    exams,
    attendancePending,
    resultsPending,
  });
}
