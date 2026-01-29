import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { verifyAdmin } from "@/lib/rbac";

type Params = { studentId: string };

/* =========================
   GET STUDENT
========================= */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    await connectDB();

    // Only admin can fetch student details
    const adminCheck = await verifyAdmin(req);
    if (adminCheck instanceof NextResponse) return adminCheck;

    const { studentId } = await params;

    const student = await User.findOne({
      _id: studentId,
      role: "STUDENT",
    }).lean();

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* =========================
   DELETE STUDENT
========================= */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    await connectDB();

    const adminCheck = await verifyAdmin(req);
    if (adminCheck instanceof NextResponse) return adminCheck;

    const { studentId } = await params;

    const student = await User.findOneAndDelete({
      _id: studentId,
      role: "STUDENT",
    }).lean();

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* =========================
   UPDATE STUDENT
========================= */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    await connectDB();

    const adminCheck = await verifyAdmin(req);
    if (adminCheck instanceof NextResponse) return adminCheck;

    const { studentId } = await params;
    const body = await req.json();

    const updated = await User.findOneAndUpdate(
      { _id: studentId, role: "STUDENT" },
      body,
      { new: true },
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
