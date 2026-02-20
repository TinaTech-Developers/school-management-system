import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import { Subject } from "@/models/Subject";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  await connectDB();

  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teacherId = session.user.id;

  try {
    // ✅ Fetch all subjects assigned to this teacher
    const subjects = await Subject.find({
      teacherId,
      isActive: true,
    }).select("_id name className classId");

    return NextResponse.json(subjects);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 },
    );
  }
}
