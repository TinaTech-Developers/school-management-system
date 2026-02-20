import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Attendance } from "@/models/Attendance";
import { verifyTeacher } from "@/lib/rbac";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  await connectDB();

  const token = await verifyTeacher(req);
  if (token instanceof NextResponse) return token;

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");

  const stats = await Attendance.aggregate([
    { $match: { classId: new mongoose.Types.ObjectId(classId!) } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  return NextResponse.json({ stats });
}
