import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Message } from "@/models/Message";
import { verifyStudent } from "@/lib/rbac";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = await verifyStudent(req);
    if (token instanceof NextResponse) return token;

    const studentId = new mongoose.Types.ObjectId(token.sub);

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: studentId }, { receiverId: studentId }],
        },
      },
      {
        $addFields: {
          otherUser: {
            $cond: [
              { $eq: ["$senderId", studentId] },
              "$receiverId",
              "$senderId",
            ],
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$otherUser",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiverId", studentId] },
                    { $eq: ["$read", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { "lastMessage.createdAt": -1 },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $match: { "user.role": "TEACHER" }, // IMPORTANT
      },
    ]);

    return NextResponse.json(conversations);
  } catch (err) {
    console.error("CONVERSATION ERROR", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
