import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { StudentSubject } from "@/models/StudentSubjects";
import "@/models/Subject";
import "@/models/Class"; // Make sure Class model is imported

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const registrations = await StudentSubject.find({
      studentId: session.user.id,
    })
      .populate({
        path: "subjectId",
        select: "name code isCompulsory classId",
        populate: [
          { path: "teacherId", select: "name" },
          { path: "classId", select: "name" }, // ✅ populate classId to get class name
        ],
      })
      .lean();

    /* Normalize for frontend */
    const subjects = registrations.map((r) => ({
      _id: r.subjectId._id.toString(),
      name: r.subjectId.name,
      code: r.subjectId.code,
      isCompulsory: r.subjectId.isCompulsory,
      teacher: r.subjectId.teacherId?.name ?? "Not Assigned",
      className: r.subjectId.classId?.name ?? "N/A", // ✅ here is the class name
    }));

    return NextResponse.json(subjects);
  } catch (error) {
    console.error("GET /student/my-subjects error:", error);
    return NextResponse.json(
      { error: "Failed to load registered subjects" },
      { status: 500 },
    );
  }
}
