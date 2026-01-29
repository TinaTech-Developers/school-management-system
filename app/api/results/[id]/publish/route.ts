import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Result } from "@/models/Result";
import { verifyAdmin } from "@/lib/rbac";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  await connectDB();

  // 🔐 Admin only
  const admin = await verifyAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { id } = await context.params; // ✅ await params
  const { publish } = await req.json();

  if (typeof publish !== "boolean") {
    return NextResponse.json(
      { error: "`publish` must be true or false" },
      { status: 400 },
    );
  }

  const updated = await Result.findByIdAndUpdate(
    id,
    {
      published: publish,
      publishedAt: publish ? new Date() : null,
      publishedBy: publish ? admin.sub : null,
    },
    { new: true },
  )
    .populate("studentId", "name")
    .populate("examId", "name term year")
    .populate("examSubjectId", "name")
    .populate("publishedBy", "name");

  if (!updated) {
    return NextResponse.json({ error: "Result not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
