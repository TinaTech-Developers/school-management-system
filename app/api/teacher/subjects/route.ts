import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import { Subject } from "@/models/Subject";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  await connectDB();

  // 1️⃣ Get logged-in teacher from session
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teacherId = session.user.id; // assuming your session stores user ID

  // 2️⃣ Get classId from query
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");

  if (!classId) {
    return NextResponse.json({ error: "Missing classId" }, { status: 400 });
  }

  try {
    // 3️⃣ Fetch subjects assigned to this teacher for this class
    const subjects = await Subject.find({
      classId,
      teacherId,
      isActive: true,
    }).select("_id name code classId");

    return NextResponse.json(subjects);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 },
    );
  }
}
