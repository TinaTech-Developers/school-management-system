import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { ClassModel } from "@/models/Class";
import { Subject } from "@/models/Subject";
import { School } from "@/models/School";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

type Params = { studentId: string };

/* =========================
   GET STUDENT (with all names)
========================= */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> },
) {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { studentId } = await params;

  const student = await User.findById(studentId).lean();

  if (!student)
    return NextResponse.json({ error: "Student not found" }, { status: 404 });

  try {
    // populate class, subjects, parent, school...
    let className = null;
    if (student.classId) {
      const cls = await ClassModel.findById(student.classId)
        .select("name")
        .lean();
      className = cls?.name || null;
    }

    let subjects: string[] = [];
    if (student.classId) {
      const subs = await Subject.find({ classId: student.classId })
        .select("name")
        .lean();
      subjects = subs.map((s) => s.name);
    }

    let parent = null;
    if (student.parentId) {
      const p = await User.findById(student.parentId)
        .select("name email phone")
        .lean();
      if (p) parent = { name: p.name, email: p.email, phone: p.phone };
    }

    let schoolName = null;
    if (student.schoolId) {
      const school = await School.findById(student.schoolId)
        .select("name")
        .lean();
      schoolName = school?.name || null;
    }

    return NextResponse.json({
      ...student,
      className,
      subjects,
      parent,
      schoolName,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
