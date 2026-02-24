import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// ✅ GET /api/teacher/notifications/[id]
export async function GET() {
  try {
    await connectDB();

    const announcements = await Notification.find({
      category: "SCHOOL",
    }).sort({ createdAt: -1 });

    return NextResponse.json(announcements);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ✅ PATCH /api/teacher/notifications/[id]
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔥 REQUIRED in Next 16
    const { id } = await context.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // security check
    if (
      notification.userId.toString() !== session.user.id &&
      notification.category !== "SCHOOL"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    notification.read = true;
    await notification.save();

    return NextResponse.json(notification);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
