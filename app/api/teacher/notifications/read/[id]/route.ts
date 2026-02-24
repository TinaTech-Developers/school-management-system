import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }, // ✅ MUST be Promise
) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ REQUIRED in Next 16
    const { id } = await context.params;

    const notification = await Notification.findById(id)
      .populate({ path: "classId", select: "name" })
      .populate({ path: "subjectId", select: "name" })
      .populate({ path: "userId", select: "name" });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 },
      );
    }

    notification.read = true;
    await notification.save();

    return NextResponse.json({
      success: true,
      notification: {
        _id: notification._id,
        title: notification.title,
        message: notification.message,
        category: notification.category,
        type: notification.type,
        read: notification.read,
        createdAt: notification.createdAt,
        className: notification.classId?.name,
        subjectName: notification.subjectId?.name,
        userName: notification.userId?.name,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
