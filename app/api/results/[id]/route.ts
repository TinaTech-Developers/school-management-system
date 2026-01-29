import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Result } from "@/models/Result";
import { verifyAdmin } from "@/lib/rbac";

type Params = { id: string };

/* =========================
   DELETE RESULT
========================= */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<Params> },
) {
  await connectDB();

  const admin = await verifyAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;

  const deleted = await Result.findByIdAndDelete(id);

  if (!deleted) {
    return NextResponse.json({ error: "Result not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Result deleted" });
}

/* =========================
   GET RESULT DETAILS
========================= */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Params> },
) {
  await connectDB();

  const admin = await verifyAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;

  const result = await Result.findById(id)
    .populate("studentId", "name")
    .populate("examId", "name term year")
    .populate("examSubjectId", "name")
    .populate("enteredBy", "name")
    .populate("publishedBy", "name");

  if (!result) {
    return NextResponse.json({ error: "Result not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}

/* =========================
   UPDATE RESULT DETAILS
========================= */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<Params> },
) {
  await connectDB();

  const admin = await verifyAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;
  const { score, grade, remarks } = await req.json();

  const updated = await Result.findByIdAndUpdate(
    id,
    {
      score,
      grade,
      remarks,
      enteredBy: admin.sub,
    },
    { new: true },
  )
    .populate("studentId", "name")
    .populate("examId", "name term year")
    .populate("examSubjectId", "name")
    .populate("enteredBy", "name")
    .populate("publishedBy", "name");

  if (!updated) {
    return NextResponse.json({ error: "Result not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
