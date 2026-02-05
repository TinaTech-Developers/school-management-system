import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";

import "@/models/Subject";
import "@/models/Class";
import "@/models/User";

import { Subject } from "@/models/Subject";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const subjects = await Subject.find({
      teacherId: session.user.id,
    })
      .populate("classId", "name")
      .lean();

    return NextResponse.json(
      subjects.map((s: any) => ({
        _id: s._id.toString(),
        name: s.name,
        className: s.classId?.name ?? "N/A",
      })),
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 },
    );
  }
}
