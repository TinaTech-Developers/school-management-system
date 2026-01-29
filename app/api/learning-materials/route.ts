import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { LearningMaterial } from "@/models/LearningMaterial";
import { verifyAdmin } from "@/lib/rbac"; // optional RBAC

export async function GET() {
  await connectDB();

  const materials = await LearningMaterial.find()
    .populate("classId", "name")
    .populate("subjectId", "name")
    .populate("uploadedBy", "name")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(materials);
}

export async function POST(req: Request) {
  await connectDB();

  const user = await verifyAdmin(req); // admin only
  if (user instanceof NextResponse) return user;

  const data = await req.json();
  const {
    title,
    description,
    fileUrl,
    fileType,
    link,
    classId,
    subjectId,
    tags,
  } = data;

  if (!title || !classId || !subjectId) {
    return NextResponse.json(
      { error: "Title, Class, and Subject are required" },
      { status: 400 },
    );
  }

  const material = await LearningMaterial.create({
    title,
    description,
    fileUrl,
    fileType,
    link,
    classId,
    subjectId,
    uploadedBy: user.sub,
    tags: tags || [],
  });

  const populated = await material.populate([
    { path: "classId", select: "name" },
    { path: "subjectId", select: "name" },
    { path: "uploadedBy", select: "name" },
  ]);

  return NextResponse.json(populated);
}
