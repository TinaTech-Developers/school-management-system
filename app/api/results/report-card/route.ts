import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { buildReportCardData } from "@/lib/reportCardData";
import { verifyAdmin } from "@/lib/rbac";
import { generateReportCardPDF } from "@/lib/reportCadPdf";

export async function GET(req: Request) {
  await connectDB();

  const admin = await verifyAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const examId = searchParams.get("examId");

  if (!studentId || !examId) {
    return NextResponse.json(
      { error: "studentId and examId required" },
      { status: 400 },
    );
  }

  const data = await buildReportCardData(studentId, examId);
  const pdfBuffer = await generateReportCardPDF(data);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="report-card.pdf"`,
    },
  });
}
