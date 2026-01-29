import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Fee } from "@/models/Fee";
import { User } from "@/models/User";
import { ClassModel } from "@/models/Class";
import { Subject } from "@/models/Subject";

export async function GET() {
  await connectDB();

  const now = new Date();
  const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    users,
    classes,
    subjects,
    exams,
    results,
    thisMonth,
    lastMonth,
    pendingFees,
  ] = await Promise.all([
    User.countDocuments(),
    ClassModel.countDocuments(),
    Subject.countDocuments(),
    0, // replace with Exam.countDocuments()
    0, // replace with Result.countDocuments()

    Fee.aggregate([
      { $match: { createdAt: { $gte: startThisMonth } } },
      { $group: { _id: null, total: { $sum: "$paidAmount" } } },
    ]),

    Fee.aggregate([
      {
        $match: {
          createdAt: { $gte: startLastMonth, $lt: startThisMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$paidAmount" } } },
    ]),

    Fee.aggregate([
      { $match: { status: { $ne: "PAID" } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const collectedThisMonth = thisMonth[0]?.total || 0;
  const collectedLastMonth = lastMonth[0]?.total || 0;

  return NextResponse.json({
    users,
    classes,
    subjects,
    exams,
    results,
    fees: {
      collectedThisMonth,
      collectedLastMonth,
      trend: collectedThisMonth - collectedLastMonth,
      pending: pendingFees[0]?.total || 0,
    },
  });
}
