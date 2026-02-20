"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Result {
  _id: string;
  marks: number;
  subject?: {
    name: string;
  };
  exam?: {
    id: string;
    name: string;
    term: string;
    year: string;
  };
}

interface ExamGroup {
  examId: string;
  examName: string;
  results: Result[];
}

export default function StudentResultsPage() {
  const { studentId, subjectId } = useParams();

  const [exams, setExams] = useState<ExamGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    fetch(
      `/api/teacher/student-results?studentId=${studentId}&subjectId=${subjectId}`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) throw new Error("Unauthorized or no data");
        const results: Result[] = data.results || [];

        // 🔹 Group results by exam
        const grouped: Record<string, ExamGroup> = {};
        results.forEach((r) => {
          if (!r.exam || !r.exam.id) return; // ✅ type narrowing

          const examId = r.exam.id;

          if (!grouped[examId]) {
            grouped[examId] = {
              examId,
              examName: `${r.exam.name} - Term ${r.exam.term} (${r.exam.year})`,
              results: [],
            };
          }

          grouped[examId].results.push(r);
        });

        setExams(Object.values(grouped)); // ✅ set the state so your UI renders
      })
      .catch((err) => {
        console.error(err);
        setExams([]); // fallback
      })
      .finally(() => setLoading(false));
  }, [studentId, subjectId]);

  // 📊 Calculate stats per exam
  const calculateStats = (results: Result[]) => {
    const total = results.reduce((sum, r) => sum + r.marks, 0);
    const average = results.length ? total / results.length : 0;
    return { total, average };
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Student Results</h1>
        <p className="text-gray-500 text-sm mt-1">
          View exam performance and marks
        </p>
      </div>

      {loading ?
        <p className="text-gray-500">Loading results...</p>
      : exams.length === 0 ?
        <div className="bg-gray-50 border rounded-2xl p-10 text-center">
          <p className="text-gray-400">No results found for this subject.</p>
        </div>
      : <div className="space-y-8">
          <AnimatePresence>
            {exams.map((exam, index) => {
              const { total, average } = calculateStats(exam.results);

              return (
                <motion.div
                  key={exam.examId}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white shadow-lg rounded-2xl p-6 space-y-6"
                >
                  {/* Exam Header */}
                  <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-lg text-slate-800">
                      {exam.examName}
                    </h2>

                    <div className="text-right">
                      <p className="text-xs text-gray-400">Average</p>
                      <p className="font-bold text-indigo-600">
                        {average.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Results Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="border-b text-gray-500">
                          <th className="py-2">Subject</th>
                          <th className="py-2 text-right">Marks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exam.results.map((r) => (
                          <tr key={r._id} className="border-b last:border-none">
                            <td className="py-3">
                              {r.subject?.name || "Subject"}
                            </td>
                            <td className="py-3 text-right font-semibold text-slate-700">
                              {r.marks}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer Stats */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <p className="text-xs text-gray-400">Total Marks</p>
                      <p className="font-bold text-slate-800">{total}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">Subjects Written</p>
                      <p className="font-bold text-slate-800">
                        {exam.results.length}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      }
    </div>
  );
}
