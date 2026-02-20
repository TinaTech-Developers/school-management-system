import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Result } from "@/models/Result";
import { verifyTeacher } from "@/lib/rbac";

interface ResultInput {
  studentId: string;
  marks: number;
}

interface PostBody {
  classId: string;
  examSubjectId: string;
  results: ResultInput[];
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ examId: string }> },
) {
  try {
    await connectDB();

    // ✅ unwrap params promise (NEXTJS 16 WAY)
    const { examId } = await context.params;

    if (!examId) {
      return NextResponse.json(
        { error: "Exam ID is required" },
        { status: 400 },
      );
    }

    const teacher = await verifyTeacher(req);
    if (teacher instanceof NextResponse) {
      return teacher;
    }

    const body: PostBody = await req.json();
    const { classId, examSubjectId, results } = body;

    if (!classId || !examSubjectId || !Array.isArray(results)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const ops = results.map((r) => ({
      updateOne: {
        filter: {
          examId,
          examSubjectId,
          studentId: r.studentId,
        },
        update: {
          $set: {
            score: r.marks,
            enteredBy: teacher.sub,
          },
        },
        upsert: true,
      },
    }));

    if (ops.length > 0) {
      await Result.bulkWrite(ops);
    }

    return NextResponse.json({
      message: "Results saved successfully",
    });
  } catch (err) {
    console.error("RESULT POST ERROR:", err);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
