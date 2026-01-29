"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
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

  const filtered = classes.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return <p className="p-6 text-gray-500">Loading classes…</p>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">My Classes</h1>
        <input
          className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
          placeholder="Search classes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((cls, i) => (
          <motion.div
            key={cls.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={`/teacher/classes/${cls.id}`}
              className="block bg-white border rounded-2xl p-5 shadow-sm hover:shadow-lg transition"
            >
              <h2 className="text-lg font-semibold">{cls.name}</h2>

              <div className="mt-3 text-sm text-gray-500">
                👥 {cls.students?.length ?? 0} Students
              </div>

              <div className="mt-1 text-sm text-gray-500">
                📘 {cls.subjectCount ?? 0} Subjects
              </div>

              <div className="mt-4 text-blue-600 text-sm font-medium">
                View class →
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
