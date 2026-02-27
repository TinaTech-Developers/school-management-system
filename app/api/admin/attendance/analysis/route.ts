import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Attendance } from "@/models/Attendance";
import { ClassModel } from "@/models/Class";

export async function GET() {
  await connectDB();

  try {
    // -----------------------------
    // 1️⃣ Fetch All Attendance Records
    // -----------------------------
    const records = await Attendance.find();

    const totalRecords = records.length;
    const present = records.filter((r) => r.status === "PRESENT").length;
    const absent = records.filter((r) => r.status === "ABSENT").length;
    const late = records.filter((r) => r.status === "LATE").length;

    const averageAttendance =
      totalRecords ? Math.round((present / totalRecords) * 100) : 0;

    // -----------------------------
    // 2️⃣ Monthly Trend (Real Aggregation)
    // -----------------------------
    const monthlyAggregation = await Attendance.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            year: { $year: "$date" },
          },
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          month: "$_id.month",
          attendanceRate: {
            $multiply: [{ $divide: ["$present", "$total"] }, 100],
          },
        },
      },
      { $sort: { month: 1 } },
    ]);

    const monthNames = [
      "",
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyTrend = monthlyAggregation.map((m) => ({
      month: monthNames[m.month],
      attendanceRate: Math.round(m.attendanceRate),
    }));

    // -----------------------------
    // 3️⃣ Class Comparison (Real Data)
    // -----------------------------
    const classes = await ClassModel.find();

    const classComparison = await Promise.all(
      classes.map(async (cls: any) => {
        const classRecords = await Attendance.find({
          classId: cls._id,
        });

        const total = classRecords.length;
        const presentCount = classRecords.filter(
          (r) => r.status === "PRESENT",
        ).length;

        const attendanceRate =
          total ? Math.round((presentCount / total) * 100) : 0;

        return {
          className: cls.name,
          attendanceRate,
        };
      }),
    );

    // -----------------------------
    // 4️⃣ Distribution
    // -----------------------------
    const distribution = [
      { name: "Present", value: present },
      { name: "Absent", value: absent },
      { name: "Late", value: late },
    ];

    // -----------------------------
    // 5️⃣ Final Response
    // -----------------------------
    return NextResponse.json({
      overview: {
        totalStudents: totalRecords,
        averageAttendance,
        present,
        absent,
        late,
      },
      monthlyTrend,
      classComparison,
      distribution,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load attendance analytics" },
      { status: 500 },
    );
  }
}
