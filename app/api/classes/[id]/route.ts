import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyAdmin } from "@/lib/rbac";
import { ClassModel } from "@/models/Class";
import "@/models/School"; // 🔥 just ensure it's loaded

/* =========================
   GET CLASS BY ID
========================= */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await params; // ✅ REQUIRED

    const klass = await ClassModel.findById(id)
      .populate("teacherId", "name email")
      .populate("schoolId", "name")
      .lean();

    if (!klass) {
      return NextResponse.json({ message: "Class not found" }, { status: 404 });
    }

    return NextResponse.json(klass);
  } catch (err: any) {
    console.error("GET /api/classes/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* =========================
   UPDATE CLASS
========================= */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const adminCheck = await verifyAdmin(req);
    if (adminCheck instanceof NextResponse) return adminCheck;

    await connectDB();
    const { id } = await params; // ✅ REQUIRED
    const body = await req.json();

    const updated = await ClassModel.findByIdAndUpdate(id, body, {
      new: true,
    }).lean();

    if (!updated) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* =========================
   DELETE CLASS
========================= */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const adminCheck = await verifyAdmin(req);
    if (adminCheck instanceof NextResponse) return adminCheck;

    await connectDB();
    const { id } = await params; // ✅ REQUIRED

    const deleted = await ClassModel.findByIdAndDelete(id).lean();

    if (!deleted) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Class deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
