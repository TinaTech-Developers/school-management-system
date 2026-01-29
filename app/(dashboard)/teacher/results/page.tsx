"use client";

import { useState, useEffect, FormEvent } from "react";
import { FiSearch, FiEdit2, FiPlus, FiX } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface Student {
  _id: string;
  name: string;
}

interface Exam {
  _id: string;
  name: string;
  term: string;
  year: number;
}

interface ExamSubject {
  _id: string;
  name: string;
}

interface Result {
  _id: string;
  studentId: Student;
  examId: Exam;
  subjectId: ExamSubject;
  score: number;
  grade: string;
  remarks: string;
}

export default function TeacherResults() {
  const [results, setResults] = useState<Result[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<ExamSubject[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Result | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<{
    analytics: { exam: { name: string }; avgScore: number }[];
    gradeDistribution: { _id: string; count: number }[];
  } | null>(null);

  /*=====================FETCH ANALYTICS==============*/

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/teacher/results/analytics");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const data = await res.json();
      setAnalytics(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load analytics");
    }
  };

  useEffect(() => {
    fetchResults();
    fetchOptions();
    fetchAnalytics();
  }, []);

  /* ================= FETCH RESULTS ================= */
  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/teacher/results");
      if (!res.ok) throw new Error("Failed to fetch results");
      const data = await res.json();
      setResults(data);
      fetchAnalytics();
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch results");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH FORM OPTIONS ================= */
  const fetchOptions = async () => {
    try {
      const [studentsRes, examsRes, subjectsRes] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/exams"),
        fetch("/api/exam-subjects"),
      ]);

      if (!studentsRes.ok || !examsRes.ok || !subjectsRes.ok)
        throw new Error("Failed to fetch form options");

      setStudents(await studentsRes.json());
      setExams(await examsRes.json());
      setSubjects(await subjectsRes.json());
    } catch (err: any) {
      toast.error(err.message || "Failed to load form options");
    }
  };

  useEffect(() => {
    fetchResults();
    fetchOptions();
  }, []);

  /* ================= FILTERED RESULTS ================= */
  const filteredResults = results.filter(
    (r) =>
      r.studentId.name.toLowerCase().includes(search.toLowerCase()) ||
      r.examId.name.toLowerCase().includes(search.toLowerCase()) ||
      r.subjectId.name.toLowerCase().includes(search.toLowerCase()),
  );

  /* ================= ADD RESULT ================= */
  const addResult = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      studentId: formData.get("studentId"),
      examId: formData.get("examId"),
      examSubjectId: formData.get("examSubjectId"),
      score: Number(formData.get("score")),
      remarks: String(formData.get("remarks")),
    };

    try {
      const res = await fetch("/api/teacher/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add result");

      toast.success("Result added successfully!");
      setResults((prev) => [data, ...prev]);
      setAddOpen(false);
      fetchAnalytics();

      e.currentTarget.reset();
    } catch (err: any) {
      toast.error(err.message || "Failed to add result");
    }
  };

  /* ================= UPDATE RESULT ================= */
  const updateResult = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selected) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      score: Number(formData.get("score")),
      grade: String(formData.get("grade")),
      remarks: String(formData.get("remarks")),
    };

    try {
      const res = await fetch(`/api/teacher/results/${selected._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to update result");
      toast.success("Result updated successfully!");
      fetchResults();
      setSelected(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update result");
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-4 md:p-6 text-gray-600">
      <ToastContainer position="top-right" />

      {/* Header + Search + Add */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h2 className="text-2xl font-bold text-gray-700">Results</h2>
        <div className="flex gap-2 items-center w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student, exam or subject"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1 px-4 py-2 b  text-[#02abfa] text-sm rounded border border-black bg-[#02abfa] transition "
          >
            <FiPlus color="gray" /> Result
          </button>
        </div>
      </div>
      {analytics && (
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Average score per exam */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-gray-700 mb-2">
              Average Score per Exam
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={analytics.analytics.map((a) => ({
                  exam: a.exam.name,
                  avgScore: a.avgScore,
                }))}
              >
                <XAxis dataKey="exam" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgScore" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Grade distribution */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-bold text-gray-700 mb-2">Grade Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={analytics.gradeDistribution.map((g) => ({
                  grade: g._id,
                  count: g.count,
                }))}
              >
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-left border-collapse">
          <thead className="bg-indigo-50">
            <tr>
              <th className="px-4 py-2">Student</th>
              <th className="px-4 py-2">Exam</th>
              <th className="px-4 py-2">Subject</th>
              <th className="px-4 py-2">Score</th>
              <th className="px-4 py-2">Grade</th>
              <th className="px-4 py-2">Remarks</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ?
              <tr>
                <td colSpan={7} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            : filteredResults.length === 0 ?
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  No results found
                </td>
              </tr>
            : filteredResults.map((r) => (
                <tr
                  key={r._id}
                  className="border-b hover:bg-indigo-50 transition"
                >
                  <td className="px-4 py-2 text-gray-700">
                    {r.studentId.name}
                  </td>
                  <td className="px-4 py-2 text-gray-700">
                    {r.examId.name} ({r.examId.term} {r.examId.year})
                  </td>
                  <td className="px-4 py-2 text-gray-700">
                    {r.subjectId.name}
                  </td>
                  <td className="px-4 py-2 text-gray-700">{r.score}</td>
                  <td className="px-4 py-2 text-gray-700">{r.grade}</td>
                  <td className="px-4 py-2 text-gray-700">{r.remarks}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => setSelected(r)}
                      className="flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition"
                    >
                      <FiEdit2 size={16} /> Edit
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
              onClick={() => setSelected(null)}
            >
              <FiX size={20} />
            </button>
            <h3 className="text-lg font-bold mb-4 text-gray-700">
              Edit Result - {selected.studentId.name}
            </h3>
            <form className="flex flex-col gap-3" onSubmit={updateResult}>
              <input
                name="score"
                type="number"
                defaultValue={selected.score}
                placeholder="Score"
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                name="grade"
                type="text"
                defaultValue={selected.grade}
                placeholder="Grade"
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <textarea
                name="remarks"
                defaultValue={selected.remarks}
                placeholder="Remarks"
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Result Modal */}
      {addOpen && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
              onClick={() => setAddOpen(false)}
            >
              <FiX size={20} />
            </button>
            <h3 className="text-lg font-bold mb-4 text-gray-700">
              Add Student Result
            </h3>
            <form className="flex flex-col gap-3" onSubmit={addResult}>
              <select
                name="studentId"
                required
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Student</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <select
                name="examId"
                required
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Exam</option>
                {exams.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.name} ({e.term} {e.year})
                  </option>
                ))}
              </select>
              <select
                name="examSubjectId"
                required
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <input
                name="score"
                type="number"
                required
                placeholder="Score"
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <textarea
                name="remarks"
                placeholder="Remarks"
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
