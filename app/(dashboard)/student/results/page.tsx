"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface Result {
  id: string;
  subject: { id: string; name: string };
  exam: { id: string; name: string; term: number; year: number };
  score: number;
  gpa: number;
  published: boolean;
  date: string;
}

interface ExamGroup {
  examId: string;
  examName: string;
  results: Result[];
}

export default function StudentResultsPage() {
  const [exams, setExams] = useState<ExamGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/results")
      .then((res) => res.json())
      .then((data) => {
        const results: Result[] = data.results || [];
        const grouped: Record<string, ExamGroup> = {};

        results.forEach((r) => {
          const examId = r.exam?.id;
          if (!examId) return;

          if (!grouped[examId]) {
            grouped[examId] = {
              examId,
              examName: `${r.exam.name} - Term ${r.exam.term} (${r.exam.year})`,
              results: [],
            };
          }

          grouped[examId].results.push(r);
        });

        setExams(Object.values(grouped));
      })
      .finally(() => setLoading(false));
  }, []);

  /* ============================= */
  /* PDF GENERATOR */
  /* ============================= */
  const downloadPDF = async (exam: ExamGroup) => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;

    // Logo
    let imgData = null;
    try {
      imgData = await fetch("/logo.png")
        .then((res) => res.blob())
        .then(
          (blob) =>
            new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            }),
        );
    } catch (err) {
      console.warn("Logo not found, skipping");
    }

    if (imgData) doc.addImage(imgData, "PNG", centerX - 20, 10, 40, 20);

    // Header
    doc.setFontSize(18);
    doc.text("OFFICIAL ACADEMIC REPORT", centerX, 40, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Exam: ${exam.examName}`, centerX, 48, { align: "center" });
    doc.line(20, 55, pageWidth - 20, 55);

    // Table
    const tableData = exam.results.map((r) => [
      r.subject.name,
      `${r.score}%`,
      r.gpa.toFixed(2),
      r.score >= 50 ? "PASS" : "FAIL",
    ]);

    autoTable(doc, {
      startY: 65,
      head: [["Subject", "Score", "GPA", "Status"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
        halign: "center",
      },
      bodyStyles: { halign: "center" },
      styles: { fontSize: 11 },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const average =
      exam.results.reduce((a, b) => a + b.score, 0) / exam.results.length;

    // Summary
    doc.setFontSize(12);
    doc.text(`Overall Average: ${average.toFixed(1)}%`, 20, finalY);
    doc.text(`Overall GPA: ${(average / 20).toFixed(2)}`, 20, finalY + 7);

    // Signatures
    const signatureY = finalY + 30;
    doc.line(30, signatureY, 80, signatureY);
    doc.text("Class Teacher", 40, signatureY + 6);
    doc.line(pageWidth - 80, signatureY, pageWidth - 30, signatureY);
    doc.text("Principal", pageWidth - 65, signatureY + 6);

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(
      "This is a computer-generated official academic report.",
      centerX,
      285,
      { align: "center" },
    );

    doc.save(`${exam.examName}-Report.pdf`);
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-slate-600">
        Loading academic results...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-indigo-50 p-4">
      <div className="w-full mx-auto space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-slate-800">
            Academic Results
          </h1>
          <p className="text-slate-500 mt-2">
            Official examination performance summary
          </p>
        </div>

        {/* EXAM CARDS */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {exams.map((exam, i) => {
            const average =
              exam.results.reduce((a, b) => a + b.score, 0) /
              exam.results.length;

            const passRate =
              (exam.results.filter((r) => r.score >= 50).length /
                exam.results.length) *
              100;

            return (
              <motion.div
                key={exam.examId}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition border border-slate-200"
              >
                <div className="flex justify-between items-start">
                  <h3 className=" font-semibold text-slate-800">
                    {exam.examName}
                  </h3>

                  <button
                    onClick={() => downloadPDF(exam)}
                    className="text-xs bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    Download PDF
                  </button>
                </div>

                {/* SUMMARY BOX */}
                <div className="mt-5 bg-indigo-50 rounded-xl p-4 space-y-2">
                  <p className="text-sm text-slate-600">
                    Average Score:
                    <span className="font-semibold ml-2 text-indigo-700">
                      {average.toFixed(1)}%
                    </span>
                  </p>

                  <p className="text-sm text-slate-600">
                    Pass Rate:
                    <span className="font-semibold ml-2 text-green-600">
                      {passRate.toFixed(0)}%
                    </span>
                  </p>
                </div>

                {/* SUBJECT LIST */}
                <div className="mt-6 space-y-3">
                  {exam.results.map((r) => {
                    const pass = r.score >= 50;

                    return (
                      <motion.div
                        key={r.id}
                        whileHover={{ scale: 1.02 }}
                        className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-xl border border-slate-200"
                      >
                        <div>
                          <p className="font-medium text-slate-800">
                            {r.subject.name}
                          </p>
                          <p
                            className={`text-xs ${
                              pass ? "text-green-600" : "text-red-500"
                            }`}
                          >
                            {pass ? "Pass" : "Fail"} • GPA {r.gpa}
                          </p>
                        </div>

                        <p className="text-lg font-semibold text-slate-700">
                          {r.score}%
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
