import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AcademicYear from "@/models/AcademicYear";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    // ✅ await params (Next 16 requirement)
    const { id } = await context.params;

    const body = await req.json();

    const updated = await AcademicYear.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!updated) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
