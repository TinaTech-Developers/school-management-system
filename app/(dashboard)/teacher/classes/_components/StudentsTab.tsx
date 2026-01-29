"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { User } from "lucide-react";

interface Student {
  _id: string;
  name: string;
  email?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export default function StudentsTab() {
  const { id: classId } = useParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!classId) return;

    async function load() {
      try {
        const res = await fetch(`/api/teacher/classes/${classId}/students`);
        const data = await res.json();
        setStudents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load students", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [classId]);

  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <User size={20} /> Students
      </h2>

      {loading ?
        <p className="text-sm text-gray-400">Loading students…</p>
      : students.length === 0 ?
        <p className="text-sm text-gray-400">No students enrolled.</p>
      : <div className="space-y-3">
          <AnimatePresence>
            {students.map((s, i) => (
              <motion.div
                key={s._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between rounded-xl border p-4 hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-700">{s.name}</p>
                  {s.email && (
                    <p className="text-sm text-gray-500">{s.email}</p>
                  )}
                </div>

                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                  Active
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      }
    </div>
  );
}
