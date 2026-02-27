import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";
import { getServerField } from "next/dist/server/lib/render-server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import "@/models/Class";
import "@/models/Subject";
import "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = session.user.id;
    const studentClassId = session.user.classId;

    const notifications = await Notification.find({
      $or: [
        { userId: studentId }, // personal notifications
        { classId: studentClassId }, // class notifications
        { category: "SCHOOL" }, // school-wide notifications
      ],
    })
      .populate("classId", "name")
      .populate("subjectId", "name")
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    const formatted = notifications.map((n) => ({
      _id: n._id,
      title: n.title,
      message: n.message,
      type: n.type,
      category: n.category,
      read: n.read,
      createdAt: n.createdAt,
      className: n.classId?.name || null,
      subjectName: n.subjectId?.name || null,
      userName: n.createdBy?.name || null,
    }));

    return NextResponse.json(formatted);
    return NextResponse.json(formatted);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
