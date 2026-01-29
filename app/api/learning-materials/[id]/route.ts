import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { LearningMaterial } from "@/models/LearningMaterial";
import { verifyAdmin } from "@/lib/rbac";

type Params = { id: string };

/* =========================
   GET MATERIAL BY ID
========================= */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Params> },
) {
  await connectDB();

  const { id } = await params;

  const material = await LearningMaterial.findById(id)
    .populate("classId", "name")
    .populate("subjectId", "name")
    .populate("uploadedBy", "name")
    .lean();

  if (!material) {
    return NextResponse.json(
      { error: "Learning Material not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(material);
}

/* =========================
   UPDATE MATERIAL (ADMIN)
========================= */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<Params> },
) {
  await connectDB();

  const admin = await verifyAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;
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

  const updated = await LearningMaterial.findByIdAndUpdate(
    id,
    {
      title,
      description,
      fileUrl,
      fileType,
      link,
      classId,
      subjectId,
      tags: tags || [],
    },
    { new: true },
  )
    .populate("classId", "name")
    .populate("subjectId", "name")
    .populate("uploadedBy", "name");

  if (!updated) {
    return NextResponse.json({ error: "Material not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

/* =========================
   DELETE MATERIAL (ADMIN)
========================= */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<Params> },
) {
  const admin = await verifyAdmin(req);
  if (admin instanceof NextResponse) return admin;

  await connectDB();

  const { id } = await params;

  const deleted = await LearningMaterial.findByIdAndDelete(id);

  if (!deleted) {
    return NextResponse.json({ error: "Material not found" }, { status: 404 });
  }

  return NextResponse.json({
    message: "Learning material deleted successfully",
  });
}
