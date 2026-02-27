import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await Notification.find({
      $or: [
        { userId: session.user.id }, // personal/class notifications
        { category: "SCHOOL" },
      ],
    })
      .populate({ path: "classId", select: "name" })
      .populate({ path: "subjectId", select: "name" })
      .populate({ path: "userId", select: "name" })
      .sort({ createdAt: -1 });

    // ✅ Format response to match frontend interface
    const formatted = notifications.map((n) => ({
      _id: n._id,
      title: n.title,
      message: n.message,
      type: n.type,
      category: n.category,
      createdAt: n.createdAt,
      read: n.read,
      className: n.classId?.name || undefined,
      subjectName: n.subjectId?.name || undefined,
      userName: n.userId?.name || undefined,
    }));

    return NextResponse.json(formatted);
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
