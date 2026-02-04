import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { StudentSubject } from "@/models/StudentSubjects";
import { LearningMaterial } from "@/models/LearningMaterial";
import "@/models/Subject";
import "@/models/Class";
import "@/models/User";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ subjectId: string }> }, // ✅ params is a Promise
) {
  try {
    const { subjectId } = await context.params; // ✅ await it

    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const registration = await StudentSubject.findOne({
      studentId: session.user.id,
      subjectId,
    })
      .populate({
        path: "subjectId",
        select: "name code isCompulsory teacherId classId",
        populate: [
          { path: "teacherId", select: "name" },
          { path: "classId", select: "name" },
        ],
      })
      .lean();

    if (!registration) {
      return NextResponse.json(
        { error: "Subject not registered" },
        { status: 403 },
      );
    }

    const materials = await LearningMaterial.find({
      subjectId,
    })
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    const subject = registration.subjectId as any;

    return NextResponse.json({
      subject: {
        _id: subject._id.toString(),
        name: subject.name,
        code: subject.code,
        isCompulsory: subject.isCompulsory,
        teacher: subject.teacherId?.name ?? "Not Assigned",
        className: subject.classId?.name ?? "N/A",
      },
      materials: materials.map((m: any) => ({
        _id: m._id.toString(),
        title: m.title,
        description: m.description,
        fileUrl: m.fileUrl,
        fileType: m.fileType,
        link: m.link,
        uploadedBy: m.uploadedBy?.name ?? "Teacher",
        createdAt: m.createdAt,
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to load subject details" },
      { status: 500 },
    );
  }
}
