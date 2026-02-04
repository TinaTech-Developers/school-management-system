import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import { Subject } from "@/models/Subject";
import { StudentSubject } from "@/models/StudentSubjects";
import mongoose from "mongoose";

/* =========================
   GET: Subjects for student class
========================= */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.classId) {
      return NextResponse.json(
        { error: "Student has no class assigned" },
        { status: 400 },
      );
    }

    await connectDB();

    const subjects = await Subject.find({
      classId: session.user.classId,
      isActive: true,
    })
      .populate({
        path: "teacherId",
        select: "name",
      })
      .lean();

    /**
     * ✅ Normalize response shape
     * This matches your frontend expectations:
     * s.subjectId.name
     */
    const normalized = subjects.map((s) => ({
      _id: s._id.toString(),
      subjectId: {
        _id: s._id.toString(),
        name: s.name,
        code: s.code,
        isCompulsory: s.isCompulsory,
      },
      teacherId: s.teacherId ?? { name: "Not Assigned" },
    }));

    return NextResponse.json(normalized);
  } catch (error) {
    console.error("GET /student/subjects error:", error);
    return NextResponse.json(
      { error: "Failed to load subjects" },
      { status: 500 },
    );
  }
}

/* =========================
   POST: Register student subjects
========================= */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.classId) {
      return NextResponse.json(
        { error: "Student has no class assigned" },
        { status: 400 },
      );
    }

    const { subjectIds } = await req.json();

    if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
      return NextResponse.json(
        { error: "No subjects selected" },
        { status: 400 },
      );
    }

    await connectDB();

    /* ✅ Validate ObjectIds */
    const objectIds = subjectIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    if (objectIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid subject IDs" },
        { status: 400 },
      );
    }

    /* ✅ Ensure subjects belong to student's class */
    const validSubjects = await Subject.find({
      _id: { $in: objectIds },
      classId: session.user.classId,
      isActive: true,
    }).select("_id isCompulsory");

    if (validSubjects.length === 0) {
      return NextResponse.json(
        { error: "Invalid subject selection" },
        { status: 400 },
      );
    }

    /* ✅ Always include compulsory subjects */
    const compulsoryIds = validSubjects
      .filter((s) => s.isCompulsory)
      .map((s) => s._id.toString());

    const finalIds = Array.from(new Set([...subjectIds, ...compulsoryIds]));

    /* ✅ Upsert to avoid duplicates */
    const bulkOps = finalIds.map((subjectId) => ({
      updateOne: {
        filter: {
          studentId: session.user.id,
          subjectId,
        },
        update: {
          studentId: session.user.id,
          subjectId,
        },
        upsert: true,
      },
    }));

    await StudentSubject.bulkWrite(bulkOps);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /student/subjects error:", error);
    return NextResponse.json(
      { error: "Subject registration failed" },
      { status: 500 },
    );
  }
}
