// api/student/classes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getToken } from "next-auth/jwt";
import { ClassModel } from "@/models/Class";

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token || token.role !== "STUDENT") {
    return NextResponse.json([], { status: 403 });
  }

  await connectDB();

  const classes = await ClassModel.find({ _id: token.classId })
    .select("name")
    .lean();

  return NextResponse.json(classes);
}
