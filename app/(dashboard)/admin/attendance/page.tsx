"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Student {
  _id: string;
  name: string;
  rollNumber?: string;
  attendance?: "Present" | "Absent" | "Late";
}

interface ClassOption {
  _id: string;
  name: string;
}

interface Subject {
  _id: string;
  name: string;
  classId: string;
}

export default function AdminAttendancePage() {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  // Fetch classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch("/api/admin/classes");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setClasses(Array.isArray(data) ? data : []);
      } catch {
        toast.error("Failed to load classes");
      }
    };
    fetchClasses();
  }, []);

  // Fetch subjects whenever a class is selected
  useEffect(() => {
    if (!selectedClass) {
      setSubjects([]);
      setSelectedSubject("");
      setStudents([]);
      return;
    }

    const fetchSubjects = async () => {
      try {
        const res = await fetch(`/api/admin/subjects?classId=${selectedClass}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setSubjects(Array.isArray(data) ? data : []);
        setSelectedSubject("");
        setStudents([]);
      } catch {
        toast.error("Failed to load subjects");
      }
    };

    fetchSubjects();
  }, [selectedClass]);

  // Fetch students when class + subject are selected
  useEffect(() => {
    if (!selectedClass || !selectedSubject) {
      setStudents([]);
      return;
    }

    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/students?classId=${selectedClass}&subjectId=${selectedSubject}`,
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setStudents(Array.isArray(data) ? data : []);
      } catch {
        toast.error("Failed to load students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClass, selectedSubject]);

  const markAttendance = (studentId: string, status: Student["attendance"]) => {
    setStudents((prev) =>
      prev.map((s) => (s._id === studentId ? { ...s, attendance: status } : s)),
    );
  };

  const saveAttendance = async () => {
    if (!selectedClass || !selectedSubject) {
      toast.error("Select class and subject");
      return;
    }

    const records = students.map((s) => ({
      studentId: s._id,
      slotId: selectedSubject, // maps to subject
      status: (s.attendance?.toUpperCase() || "ABSENT") as
        | "PRESENT"
        | "ABSENT"
        | "LATE"
        | "EXCUSED",
      date: new Date(date).toISOString(),
      remarks: "",
    }));

    try {
      const res = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: selectedClass, records }),
      });
      const data = await res.json();
      if (data.success) toast.success("Attendance saved successfully");
      else toast.error(data.error || "Failed to save attendance");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save attendance");
    }
  };

  return (
    <div className="w-full p-8 space-y-8 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Attendance Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Record and manage daily student attendance
          </p>
        </div>

        <button
          onClick={saveAttendance}
          disabled={!selectedClass || !selectedSubject || students.length === 0}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Save Attendance
        </button>
      </div>

      {/* Filters Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2.5 border rounded-lg text-sm text-gray-600  focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full p-2.5 border rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option className="text-gray-600" key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={!subjects.length}
            className="w-full p-2.5 border rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option className="text-gray-600" key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Summary Box */}
        <div className="bg-gray-50 rounded-xl p-4 flex flex-col justify-center">
          <p className="text-xs text-gray-500">Summary</p>
          <div className="flex gap-4 mt-2 text-sm font-medium">
            <span className="text-green-600">
              P: {students.filter((s) => s.attendance === "Present").length}
            </span>
            <span className="text-red-600">
              A: {students.filter((s) => s.attendance === "Absent").length}
            </span>
            <span className="text-yellow-600">
              L: {students.filter((s) => s.attendance === "Late").length}
            </span>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wide">
            <tr>
              <th className="px-6 py-4 text-left">#</th>
              <th className="px-6 py-4 text-left">Student Name</th>
              <th className="px-6 py-4 text-left">Roll Number</th>
              <th className="px-6 py-4 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ?
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-500">
                  Loading students...
                </td>
              </tr>
            : students.length === 0 ?
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-400">
                  No students available. Select class and subject.
                </td>
              </tr>
            : students.map((s, idx) => (
                <tr
                  key={s._id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 text-gray-500">{idx + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-700">
                    {s.name}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {s.rollNumber || "-"}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    {["Present", "Absent", "Late"].map((status) => (
                      <motion.button
                        key={status}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          markAttendance(s._id, status as Student["attendance"])
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          s.attendance === status ?
                            status === "Present" ? "bg-green-600 text-white"
                            : status === "Absent" ? "bg-red-600 text-white"
                            : "bg-yellow-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {status}
                      </motion.button>
                    ))}
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
