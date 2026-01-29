import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Assignment } from "@/models/Assignment";
import { connectDB } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: NextRequest, context: RouteContext) {
  await connectDB();

  const { id } = await context.params;

  const token = await getToken({ req });
  if (!token?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const updated = await Assignment.findOneAndUpdate(
    { _id: id, createdBy: token.sub },
    body,
    { new: true },
  );

  if (!updated) {
    return NextResponse.json(
      { error: "Assignment not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  await connectDB();

  const { id } = await context.params;

  const token = await getToken({ req });
  if (!token?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await Assignment.deleteOne({
    _id: id,
    createdBy: token.sub,
  });

  if (result.deletedCount === 0) {
    return NextResponse.json(
      { error: "Assignment not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true });
}
