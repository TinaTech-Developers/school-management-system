import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Assignment } from "@/models/Assignment";
import "@/models/Subject";
import { connectDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  await connectDB();

  const token = await getToken({ req });
  if (!token?.sub) {
    return NextResponse.json([], { status: 401 });
  }

  const assignments = await Assignment.find({
    createdBy: token.sub,
  })
    .populate("subjectId", "name")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(assignments);
}

export async function POST(req: NextRequest) {
  await connectDB();

  const token = await getToken({ req });
  if (!token?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const assignment = await Assignment.create({
    title: body.title,
    description: body.description,
    subjectId: body.subjectId,
    dueDate: body.dueDate,
    createdBy: token.sub,
  });

  return NextResponse.json(assignment);
}
