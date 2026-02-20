import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Message } from "@/models/Message";
import { verifyTeacher } from "@/lib/rbac";
import mongoose from "mongoose";

// GET messages between teacher and a user (student/parent)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = await verifyTeacher(req);
    if (token instanceof NextResponse) return token;

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Fetch messages between teacher and user
    const messages = await Message.find({
      $or: [
        { senderId: token.sub, receiverId: userId },
        { senderId: userId, receiverId: token.sub },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("senderId", "name _id role")
      .populate("receiverId", "name _id role")
      .lean();

    // Mark all received messages as read
    await Message.updateMany(
      { receiverId: token.sub, senderId: userId, read: false },
      { read: true },
    );

    return NextResponse.json({ success: true, messages });
  } catch (err) {
    console.error("MESSAGES GET ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Send a new message
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const token = await verifyTeacher(req);
    if (token instanceof NextResponse) return token;

    const body = await req.json();
    const { receiverId, content } = body;

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: "receiverId and content are required" },
        { status: 400 },
      );
    }

    const message = await Message.create({
      senderId: token.sub,
      receiverId,
      content,
      read: false,
    });

    await message.populate("senderId", "name _id role");

    return NextResponse.json({ success: true, message });
  } catch (err) {
    console.error("MESSAGES POST ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
