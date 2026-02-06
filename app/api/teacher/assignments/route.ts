import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyTeacher } from "@/lib/rbac";
import { Assignment } from "@/models/Assignment";

// ================= GET ASSIGNMENTS =================
export async function GET(req: NextRequest) {
  const teacherCheck = await verifyTeacher(req);
  if (teacherCheck instanceof NextResponse) return teacherCheck;

  await connectDB();

  const url = new URL(req.url);
  const subjectId = url.searchParams.get("subjectId");

  if (!subjectId) return NextResponse.json([]);

  const assignments = await Assignment.find({ subjectId })
    .populate("createdBy", "name")
    .sort({ createdAt: -1 });

  return NextResponse.json(assignments);
}

// ================= POST ASSIGNMENT =================
export async function POST(req: NextRequest) {
  const teacherCheck = await verifyTeacher(req);
  if (teacherCheck instanceof NextResponse) return teacherCheck;

  const token = teacherCheck;
  const body = await req.json();

  const { title, description, subjectId, fileUrl, dueDate } = body;

  if (!title || !subjectId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  await connectDB();

  let fileType = "file";

  if (fileUrl) {
    const ext = fileUrl.split(".").pop()?.toLowerCase();

    if (ext === "pdf") fileType = "pdf";
    else if (["doc", "docx"].includes(ext || "")) fileType = "doc";
    else if (["jpg", "jpeg", "png"].includes(ext || "")) fileType = "image";
    else if (["mp4", "mov"].includes(ext || "")) fileType = "video";
  }

  const assignment = await Assignment.create({
    title,
    description,
    subjectId,
    fileUrl,
    fileType,
    dueDate,
    createdBy: token.sub,
  });

  return NextResponse.json(assignment, { status: 201 });
}

// ================= DELETE ASSIGNMENT =================
export async function DELETE(req: NextRequest) {
  const teacherCheck = await verifyTeacher(req);
  if (teacherCheck instanceof NextResponse) return teacherCheck;

  const token = teacherCheck;
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  await connectDB();

  const assignment = await Assignment.findById(id);

  if (!assignment)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (assignment.createdBy.toString() !== token.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await assignment.deleteOne();

  return NextResponse.json({ message: "Deleted" });
}
