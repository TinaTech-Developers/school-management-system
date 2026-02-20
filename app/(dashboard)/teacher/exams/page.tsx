"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiBarChart2 } from "react-icons/fi";

interface Exam {
  _id: string;
  name: string;
  term: string;
  startDate?: string;
  endDate?: string;
}

export default function TeacherExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/teacher/exams")
      .then((res) => res.json())
      .then(setExams)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto p-6">
        {/* HEADER */}
        <div className="bg-white border rounded-xl p-6 mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            My Examinations
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            View exams for your classes and analyze results
          </p>
        </div>

        {/* CONTENT */}
        <div className="bg-white border rounded-xl overflow-hidden">
          {loading && (
            <div className="p-10 text-center text-gray-500">
              Loading exams...
            </div>
          )}

          {!loading && exams.length === 0 && (
            <div className="p-10 text-center text-gray-500">
              No exams assigned to you yet.
            </div>
          )}

          {!loading && exams.length > 0 && (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-gray-600">
                  <th className="px-6 py-4 font-medium">Exam Name</th>
                  <th className="px-6 py-4 font-medium">Term</th>
                  <th className="px-6 py-4 font-medium">Start Date</th>
                  <th className="px-6 py-4 font-medium">End Date</th>
                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {exams.map((exam) => (
                  <tr
                    key={exam._id}
                    className="border-b last:border-0 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {exam.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{exam.term}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {exam.startDate ?
                        new Date(exam.startDate).toLocaleDateString()
                      : "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {exam.endDate ?
                        new Date(exam.endDate).toLocaleDateString()
                      : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-4 text-sm font-medium">
                        <Link
                          href={`/teacher/exams/${exam._id}/analysis`}
                          className="flex items-center gap-1 text-blue-600 text-xs hover:text-blue-800"
                        >
                          <FiBarChart2 size={16} />
                          View Analysis
                        </Link>
                        <Link
                          href={`/teacher/exams/${exam._id}/results`}
                          className="text-green-600 text-xs hover:text-green-800"
                        >
                          Enter Results
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
