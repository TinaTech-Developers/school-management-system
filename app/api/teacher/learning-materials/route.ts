import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyTeacher } from "@/lib/rbac";
import { LearningMaterial } from "@/models/LearningMaterial";

// ---------------- GET: List Materials by Subject ----------------
export async function GET(req: NextRequest) {
  const teacherCheck = await verifyTeacher(req);
  if (teacherCheck instanceof NextResponse) return teacherCheck;

  await connectDB();

  const url = new URL(req.url);
  const subjectId = url.searchParams.get("subjectId");
  if (!subjectId) return NextResponse.json([], { status: 200 });

  const materials = await LearningMaterial.find({ subjectId })
    .populate("uploadedBy", "name email")
    .populate("subjectId", "name")
    .sort({ createdAt: -1 });

  const mapped = materials.map((m) => ({
    _id: m._id,
    title: m.title,
    description: m.description,
    fileUrl: m.fileUrl,
    link: m.link,
    tags: m.tags,
    uploadedBy: (m.uploadedBy as any)?.name || "Unknown",
    createdAt: m.createdAt.toISOString(),
  }));

  return NextResponse.json(mapped);
}

// ---------------- POST: Upload Material ----------------
export async function POST(req: NextRequest) {
  const teacherCheck = await verifyTeacher(req);
  if (teacherCheck instanceof NextResponse) return teacherCheck;

  const token = teacherCheck;
  const body = await req.json();

  const { title, fileUrl, link, subjectId, description, tags } = body;

  if (!title || (!fileUrl && !link) || !subjectId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  await connectDB();

  let fileType = "link";

  if (fileUrl) {
    const ext = fileUrl.split(".").pop()?.toLowerCase();
    if (["pdf"].includes(ext || "")) fileType = "pdf";
    else if (["doc", "docx"].includes(ext || "")) fileType = "doc";
    else if (["mp4", "mov", "avi"].includes(ext || "")) fileType = "video";
    else if (["jpg", "jpeg", "png", "webp"].includes(ext || ""))
      fileType = "image";
    else fileType = "file";
  }

  const material = await LearningMaterial.create({
    title,
    description,
    fileUrl,
    link,
    subjectId,
    tags,
    fileType,
    uploadedBy: token.sub,
  });

  return NextResponse.json(
    {
      ...material.toObject(),
      uploadedBy: (token as any)?.name || "You",
    },
    { status: 201 },
  );
}

// ---------------- DELETE: Remove Material ----------------
export async function DELETE(req: NextRequest) {
  const teacherCheck = await verifyTeacher(req);
  if (teacherCheck instanceof NextResponse) return teacherCheck;

  const token = teacherCheck;
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Material ID is required" },
      { status: 400 },
    );
  }

  await connectDB();

  const material = await LearningMaterial.findById(id);
  if (!material)
    return NextResponse.json({ error: "Material not found" }, { status: 404 });

  if (material.uploadedBy.toString() !== token.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await material.deleteOne();
  return NextResponse.json({ message: "Material deleted successfully" });
}
