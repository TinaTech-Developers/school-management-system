"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Student {
  _id: string;
  name: string;
  avatar?: string;
}

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

export default function StudentsModule() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [search, setSearch] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Fetch classes
  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then((data) =>
        setClasses(
          Array.isArray(data) ? data : data.classes || data.data || [],
        ),
      )
      .catch(() => setClasses([]));
  }, []);

  // Fetch subjects
  useEffect(() => {
    if (!selectedClass) {
      setSubjects([]);
      setSelectedSubject("");
      return;
    }

    fetch(`/api/teacher/subjects?classId=${selectedClass}`)
      .then((res) => res.json())
      .then((data) => setSubjects(Array.isArray(data) ? data : data.data || []))
      .catch(() => setSubjects([]))
      .finally(() => setSelectedSubject(""));
  }, [selectedClass]);

  // Fetch students
  useEffect(() => {
    if (!selectedClass || !selectedSubject) {
      setStudents([]);
      return;
    }

    setLoadingStudents(true);
    fetch(`/api/students?classId=${selectedClass}&subjectId=${selectedSubject}`)
      .then((res) => res.json())
      .then((data) =>
        setStudents(
          Array.isArray(data) ? data : data.students || data.data || [],
        ),
      )
      .catch(() => setStudents([]))
      .finally(() => setLoadingStudents(false));
  }, [selectedClass, selectedSubject]);

  // 🔍 Search Filter
  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;
    return students.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [students, search]);

  return (
    <div className="p-8 w-full mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Students Module</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Manage students by class and subject
        </p>
      </div>

      {/* Filters + Search */}
      <div className="bg-white shadow-md rounded-xl p-6 flex flex-wrap gap-4 items-center">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-4 py-2 rounded-xl border focus:ring-2 text-gray-700 text-sm focus:ring-indigo-400 outline-none"
        >
          <option value="">Select Class</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2 rounded-xl border focus:ring-2 text-gray-700 text-sm focus:ring-indigo-400 outline-none"
          disabled={!subjects.length}
        >
          <option value="">Select Subject</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Search */}
        <input
          type="text"
          placeholder="Search student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 rounded-xl border focus:ring-2 text-gray-700 text-sm focus:ring-indigo-400 outline-none"
        />
      </div>

      {/* Stats */}
      {selectedSubject && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-6 shadow-lg">
          <p className="text-sm opacity-80">Total Students</p>
          <h2 className="text-xl font-bold">{filteredStudents.length}</h2>
        </div>
      )}

      {/* Students Grid */}
      {loadingStudents ?
        <p className="text-gray-500">Loading students...</p>
      : filteredStudents.length === 0 && selectedSubject ?
        <div className="bg-gray-50 p-10 text-center rounded-2xl border">
          <p className="text-gray-400">No students found for this selection.</p>
        </div>
      : <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredStudents.map((s, i) => (
              <motion.div
                key={s._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl shadow-md p-5 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {s.avatar ?
                      <img
                        src={s.avatar}
                        alt={s.name}
                        className="w-16 h-16 rounded-full border-4 border-white object-cover shadow-md"
                      />
                    : <div className="w-16 h-16 rounded-full border-4 border-white bg-indigo-600 text-white flex items-center justify-center text-lg font-bold shadow-md">
                        {s.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                    }
                  </div>

                  <div>
                    <p className="font-semibold text-slate-800">{s.name}</p>
                    <p className="text-xs text-gray-400">
                      ID: {s._id.slice(-6)}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between mt-6 text-sm">
                  <Link
                    href={`/teacher/students/${s._id}`}
                    className="text-indigo-600 hover:underline"
                  >
                    View Profile
                  </Link>
                  {/* 
                  <Link
                    href={`/teacher/students/${s._id}/results/${selectedSubject}`}
                    className="text-green-600 hover:underline"
                  >
                    Results
                  </Link> */}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      }
    </div>
  );
}
