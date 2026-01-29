"use client";

import { useEffect, useState } from "react";
import { Result } from "@/types/result";
import PublishModal from "./_components/PublishModal";

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Result | null>(null);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/results");
      const data: Result[] = await res.json();
      setResults(
        data.map((r) => ({
          ...r,
          examId: { ...r.examId, year: Number(r.examId.year) }, // ensure year is number
        })),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  if (loading) return <p className="p-6">Loading results...</p>;

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold text-gray-700">Results</h1>

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="border px-3 py-2">Student</th>
            <th className="border px-3 py-2">Exam</th>
            <th className="border px-3 py-2">Subject</th>
            <th className="border px-3 py-2">Score</th>
            <th className="border px-3 py-2">Grade</th>
            <th className="border px-3 py-2">Published</th>
            <th className="border px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r._id} className="text-gray-500">
              <td className="border px-3 py-2">{r.studentId.name}</td>
              <td className="border px-3 py-2">
                {r.examId.name} ({r.examId.term} {r.examId.year})
              </td>
              <td className="border px-3 py-2">{r.examSubjectId.name}</td>
              <td className="border px-3 py-2">{r.score}</td>
              <td className="border px-3 py-2">{r.grade || "-"}</td>
              <td className="border px-3 py-2">{r.published ? "Yes" : "No"}</td>
              <td className="border px-3 py-2">
                <button
                  className="px-2 py-1 text-sm bg-gray-200 rounded"
                  onClick={() => setSelected(r)}
                >
                  Actions
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <PublishModal
          result={selected}
          onSaved={() => {
            fetchResults();
            setSelected(null);
          }}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
