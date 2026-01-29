import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Material } from "@/models/Material";
import { verifyTeacher } from "@/lib/rbac"; // ✅ use your existing function

// ---------------- GET: List Materials ----------------
export async function GET(req: Request) {
  const teacherCheck = await verifyTeacher(req);

  // If unauthorized, teacherCheck is a NextResponse → return it
  if (teacherCheck instanceof NextResponse) return teacherCheck;

  // ✅ Now TypeScript knows this is a token
  const token = teacherCheck;

  await connectDB();

  const url = new URL(req.url);
  const classId = url.searchParams.get("classId");

  let query: any = {};
  if (classId) query.classId = classId;

  const materials = await Material.find(query)
    .populate("uploadedBy", "name email")
    .populate("classId", "name")
    .populate("subjectId", "name")
    .sort({ createdAt: -1 });

  return NextResponse.json(materials);
}

// ---------------- POST: Upload Material ----------------

export async function POST(req: Request) {
  const teacherCheck = await verifyTeacher(req);

  if (teacherCheck instanceof NextResponse) return teacherCheck;

  // ✅ TS now knows teacherCheck is AuthToken
  const token = teacherCheck;

  const body = await req.json();
  const { title, fileUrl, classId } = body;

  if (!title || !fileUrl || !classId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const material = await Material.create({
    title,
    fileUrl,
    classId,
    uploadedBy: token.sub, // ✅ TS is happy now
  });

  return NextResponse.json(material, { status: 201 });
}

// ---------------- PUT: Update Material ----------------
export async function PUT(req: Request) {
  const teacherCheck = await verifyTeacher(req);

  if (teacherCheck instanceof NextResponse) return teacherCheck;

  // ✅ TS now knows teacherCheck is AuthToken
  const token = teacherCheck;
  const body = await req.json();
  const { id, title, description, fileUrl, type } = body;

  if (!id) {
    return NextResponse.json(
      { error: "Material ID is required" },
      { status: 400 }
    );
  }

  await connectDB();

  const material = await Material.findById(id);
  if (!material)
    return NextResponse.json({ error: "Material not found" }, { status: 404 });

  // Only uploader or admin can update
  if (material.uploadedBy.toString() !== teacherCheck.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  material.title = title || material.title;
  material.description = description || material.description;
  material.fileUrl = fileUrl || material.fileUrl;
  material.type = type || material.type;

  await material.save();

  return NextResponse.json(material);
}

// ---------------- DELETE: Remove Material ----------------
export async function DELETE(req: Request) {
  const teacherCheck = await verifyTeacher(req);

  // If unauthorized, teacherCheck is a NextResponse → return it
  if (teacherCheck instanceof NextResponse) return teacherCheck;

  // ✅ Now TypeScript knows this is a token
  const token = teacherCheck;

  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id)
    return NextResponse.json(
      { error: "Material ID is required" },
      { status: 400 }
    );

  await connectDB();

  const material = await Material.findById(id);
  if (!material)
    return NextResponse.json({ error: "Material not found" }, { status: 404 });

  // Only uploader can delete
  if (material.uploadedBy.toString() !== teacherCheck.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await material.deleteOne();

  return NextResponse.json({ message: "Material deleted successfully" });
}
