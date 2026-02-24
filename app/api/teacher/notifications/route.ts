import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const notifications = await Notification.find({
      $or: [
        { userId: session.user.id }, // personal/class notifications
        { category: "SCHOOL" },
      ],
    }).sort({ createdAt: -1 });

    return NextResponse.json(notifications);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, message, type, classId, subjectId } = body;

    if (!title || !message || !classId) {
      return NextResponse.json(
        { error: "Title, message, and classId are required" },
        { status: 400 },
      );
    }

    const notification = await Notification.create({
      userId: session.user.id,
      title,
      message,
      type: type || "INFO",
      category: "CLASS",
      classId,
      subjectId,
      read: false,
    });

    return NextResponse.json(notification);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
