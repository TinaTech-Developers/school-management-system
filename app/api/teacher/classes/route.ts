// app/api/teacher/classes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db";
import { ClassModel } from "@/models/Class";
import "@/models/User";
import "@/models/School";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.sub || token.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const classes = await ClassModel.find({
      teacherId: token.sub,
    })
      .populate("schoolId", "name")
      .lean();

    const normalized = classes.map((c: any) => ({
      id: c._id,
      name: c.name,
      school: c.schoolId?.name || "",
      createdAt: c.createdAt,
    }));

    return NextResponse.json(normalized);
  } catch (err) {
    console.error("TEACHER CLASSES GET ERROR:", err);
    return NextResponse.json([], { status: 500 });
  }
}
