import PDFDocument from "pdfkit";
import { ReportCardData } from "../types/report-card";

export async function generateReportCardPDF(
  data: ReportCardData,
): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk) => chunks.push(chunk));

  doc.fontSize(20).text("Student Report Card", { align: "center" });
  doc.moveDown();

  doc.fontSize(12);
  doc.text(`Student: ${data.student.name}`);
  doc.text(`Class: ${data.student.className}`);
  doc.text(`Exam: ${data.exam.name} (${data.exam.term} ${data.exam.year})`);
  doc.moveDown();

  doc.fontSize(14).text("Results:");
  doc.moveDown(0.5);

  data.results.forEach((r) => {
    doc.fontSize(12).text(`${r.subject}: ${r.score} — Grade ${r.grade}`);
  });

  doc.moveDown();
  doc.fontSize(14).text(`GPA: ${data.gpa}`);

  doc.end();

  return Buffer.concat(chunks);
}
