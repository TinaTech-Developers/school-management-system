"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Class {
  _id: string;
  name: string;
}

interface Subject {
  _id: string;
  name: string;
  classId: string;
  teacherId: string;
}

interface AttendanceHistoryRecord {
  _id: string;
  studentId: { _id: string; name: string };
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  remarks?: string;
  date: string;
}

export default function AttendanceHistoryPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [history, setHistory] = useState<AttendanceHistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Fetch teacher's classes
  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then((data) =>
        setClasses(Array.isArray(data) ? data : data.classes || []),
      )
      .catch(() => setClasses([]));
  }, []);

  // Fetch subjects when class is selected
  useEffect(() => {
    if (!selectedClass) {
      setSubjects([]);
      setSelectedSubject("");
      return;
    }

    fetch(`/api/teacher/subjects?classId=${selectedClass}`)
      .then((res) => res.json())
      .then((data) =>
        setSubjects(Array.isArray(data) ? data : data.subjects || []),
      )
      .catch(() => setSubjects([]))
      .finally(() => setSelectedSubject(""));
  }, [selectedClass]);

  // Fetch attendance history
  const fetchHistory = async () => {
    if (!selectedClass || !selectedSubject) return;
    setLoading(true);

    try {
      let url = `/api/teacher/attendance?classId=${selectedClass}&slotId=${selectedSubject}`;

      // Optional date filters
      if (dateFrom) url += `&dateFrom=${dateFrom}`;
      if (dateTo) url += `&dateTo=${dateTo}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setHistory(data.records || []);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error(err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedClass, selectedSubject, dateFrom, dateTo]);

  return (
    <div className="p-8 w-full mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Attendance History</h1>
        <Link
          href="/teacher/attendance"
          className="text-blue-600 hover:underline text-sm bg-gray-300 rounded-sm px-3 py-1 "
        >
          Back to Attendance
        </Link>
      </div>
      {/* Filters */}
      <div className="bg-gray-100 p-6 rounded-lg shadow flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border px-3 py-2 rounded text-gray-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-sm"
          >
            <option value="">Select class</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">
            Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={!subjects.length}
            className="border px-3 py-2 rounded text-gray-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-sm"
          >
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border px-3 py-2 rounded text-gray-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-sm"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border px-3 py-2 rounded text-gray-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-sm"
          />
        </div>

        <button
          onClick={fetchHistory}
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 mt-6"
        >
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ?
          <p className="text-gray-700 mt-4">Loading history...</p>
        : history.length === 0 ?
          <p className="text-gray-500 mt-4">No records found.</p>
        : <table className="w-full border border-gray-300 rounded-lg text-sm text-left mt-4">
            <thead className="bg-gray-50 border-b border-gray-300">
              <tr>
                <th className="py-2 px-3 border-b border-gray-300 text-gray-700 font-semibold">
                  Date
                </th>
                <th className="py-2 px-3 border-b border-gray-300 text-gray-700 font-semibold">
                  Student
                </th>
                <th className="py-2 px-3 border-b border-gray-300 text-gray-700 font-semibold">
                  Status
                </th>
                <th className="py-2 px-3 border-b border-gray-300 text-gray-700 font-semibold">
                  Remarks
                </th>
              </tr>
            </thead>
            <tbody>
              {history.map((rec) => (
                <tr
                  key={rec._id}
                  className="border-b border-gray-300 last:border-none"
                >
                  <td className="py-2 px-3 text-gray-600 text-sm">
                    {new Date(rec.date).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-3 text-gray-600 text-sm">
                    {rec.studentId?.name || "Unknown"}
                  </td>
                  <td className="py-2 px-3 text-gray-600 text-sm">
                    {rec.status}
                  </td>
                  <td className="py-2 px-3 text-gray-600 text-sm">
                    {rec.remarks || ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>
    </div>
  );
}
