import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { ClassModel } from "@/models/Class";
import { verifyAdmin } from "@/lib/rbac";
import mongoose from "mongoose";
import { getToken } from "next-auth/jwt";
import { AuthToken } from "@/types/auth";

const SECRET = process.env.NEXTAUTH_SECRET!;

async function requireTeacherOrAdmin(req: NextRequest) {
  const token = (await getToken({ req, secret: SECRET })) as AuthToken | null;

  if (!token || !["ADMIN", "TEACHER"].includes(token.role)) {
    return NextResponse.json(
      { error: "Unauthorized. Admins or Teachers only." },
      { status: 403 },
    );
  }

  return token;
}

/* ---------------- GET ---------------- */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const token = await requireTeacherOrAdmin(req);
  if (token instanceof NextResponse) return token;

  await connectDB();

  const { id: classId } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(classId)) {
    return NextResponse.json({ error: "Invalid class ID" }, { status: 400 });
  }

  const students = await User.find({ role: "STUDENT", classId })
    .select("-password")
    .lean();

  return NextResponse.json(students);
}

/* ---------------- POST: Assign Student ---------------- */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const token = await requireTeacherOrAdmin(req);
  if (token instanceof NextResponse) return token;

  await connectDB();

  const { id: classId } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(classId)) {
    return NextResponse.json({ error: "Invalid class ID" }, { status: 400 });
  }

  const body = await req.json();
  const { studentId } = body;

  if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
    return NextResponse.json(
      { error: "Invalid or missing student ID" },
      { status: 400 },
    );
  }

  const classDoc = await ClassModel.findById(classId);
  if (!classDoc) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const student = await User.findOne({
    _id: studentId,
    role: "STUDENT",
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  student.id = classId;
  await student.save();

  return NextResponse.json({
    message: "Student assigned to class successfully",
  });
}

// to test later

// import { NextRequest, NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import { connectDB } from "@/lib/db";
// import { ClassModel } from "@/models/Class";
// import "@/models/User";

// export async function GET(
//   req: NextRequest,
//   { params }: { params: { id: string } },
// ) {
//   await connectDB();

//   const token = await getToken({
//     req,
//     secret: process.env.NEXTAUTH_SECRET,
//   });

//   if (!token?.sub || token.role !== "TEACHER") {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const cls = await ClassModel.findOne({
//     _id: params.id,
//     teacherId: token.sub,
//   })
//     .populate("students", "name email")
//     .lean();

//   if (!cls) {
//     return NextResponse.json([], { status: 200 });
//   }

//   return NextResponse.json(
//     (cls.students || []).map((s: any) => ({
//       _id: s._id.toString(),
//       name: s.name,
//       email: s.email,
//     })),
//   );
// }
