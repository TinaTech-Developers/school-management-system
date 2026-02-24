"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface TeacherClass {
  id: string;
  name: string;
  students: any[];
  subjectCount?: number;
}

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/teacher/classes")
      .then((r) => r.json())
      .then(setClasses)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      classes.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [classes, search],
  );

  const totalStudents = classes.reduce(
    (acc, cls) => acc + (cls.students?.length ?? 0),
    0,
  );

  if (loading) {
    return (
      <div className="p-10 flex items-center justify-center">
        <p className="text-gray-500 animate-pulse text-lg">Loading classes…</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-10 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">My Classes</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Manage and view all your assigned classes
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <input
            className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="Search classes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Classes</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {classes.length}
          </p>
        </div>

        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total Students</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {totalStudents}
          </p>
        </div>

        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Filtered Results</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {filtered.length}
          </p>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((cls, i) => (
          <motion.div
            key={cls.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={`/teacher/classes/${cls.id}`}
              className="group block bg-white border rounded-xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Class Name */}
              <h2 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition">
                {cls.name}
              </h2>

              {/* Divider */}
              <div className="h-px bg-gray-100 my-4" />

              {/* Info */}
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-between">
                  <span>👥 Students</span>
                  <span className="font-medium text-gray-700">
                    {cls.students?.length ?? 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>📘 Subjects</span>
                  <span className="font-medium text-gray-700">
                    {cls.subjectCount ?? 0}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-6 text-sm font-medium text-blue-600 group-hover:underline">
                View class →
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
