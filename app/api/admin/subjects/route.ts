import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import { Subject } from "@/models/Subject";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  await connectDB();

  const session = await getServerSession(authOptions);

  // 🔐 Check authentication
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 🔐 Check role
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    if (!classId) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 },
      );
    }

    // ✅ Fetch ALL subjects for selected class
    const subjects = await Subject.find({
      classId,
      isActive: true,
    }).select("_id name classId");

    return NextResponse.json(subjects);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 },
    );
  }
}
