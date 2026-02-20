"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiPlus } from "react-icons/fi";

interface Exam {
  _id: string;
  name: string;
  term: string;
  startDate?: string;
  endDate?: string;
}

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/exams")
      .then((res) => res.json())
      .then(setExams)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* HEADER */}
        <div className="bg-white border rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                Examination Management
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Manage examination sessions and subject assignments
              </p>
            </div>

            <Link
              href="/admin/exams/create"
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-black transition"
            >
              <FiPlus size={16} />
              New Examination
            </Link>
          </div>
        </div>

        {/* CONTENT */}
        <div className="bg-white border rounded-xl overflow-hidden">
          {loading && (
            <div className="p-10 text-center text-gray-500">
              Loading examinations...
            </div>
          )}

          {!loading && exams.length === 0 && (
            <div className="p-10 text-center">
              <h3 className="text-gray-700 font-medium">
                No examinations found
              </h3>
              <p className="text-gray-500 text-sm mt-2 mb-6">
                Create your first examination session to begin.
              </p>

              <Link
                href="/admin/exams/create"
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm"
              >
                <FiPlus size={16} />
                Create Examination
              </Link>
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
                          href={`/admin/exams/${exam._id}`}
                          className="text-gray-700 hover:text-black"
                        >
                          View
                        </Link>

                        <Link
                          href={`/admin/exams/${exam._id}/assign-subject`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Assign Subjects
                        </Link>

                        <Link
                          href={`/admin/exams/${exam._id}/analysis`}
                          className="text-green-600 hover:text-green-800"
                        >
                          Analysis
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
