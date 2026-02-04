import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";

export async function GET(req: NextRequest) {
  await connectDB();

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || token.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await Notification.find({
    userId: token.sub,
  })
    .sort({ createdAt: -1 })
    .lean();

  const formatted = notifications.map((n: any) => ({
    _id: n._id.toString(),
    title: n.title,
    description: n.message,
    category: n.category,
    type: n.type,
    read: n.read,
    createdAt: n.createdAt,
  }));

  return NextResponse.json(formatted);
}
