import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Department } from "@/models/Department";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    // ✅ Next 16 requires awaiting params
    const { id } = await context.params;

    const body = await req.json();

    const updated = await Department.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update department" },
      { status: 500 },
    );
  }
}
