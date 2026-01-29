// get classes for a specific class by id
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import { ClassModel } from "@/models/Class";
import "@/models/User";
import "@/models/School";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await context.params;

    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.sub || token?.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cls = await ClassModel.findOne({
      _id: id,
      teacherId: token.sub,
    })
      .populate("schoolId", "name")
      .lean();

    if (!cls) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: cls._id.toString(),
      name: cls.name,
      school: cls.schoolId?.name || "",
      createdAt: cls.createdAt,
    });
  } catch (err) {
    console.error("TEACHER CLASS GET ERROR:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
