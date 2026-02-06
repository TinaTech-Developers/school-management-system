"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, CalendarDays, MoreVertical } from "lucide-react";

interface Assignment {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  subjectId?: {
    name: string;
    className: string;
  };
}

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    fetchAssignments();
  }, []);

  async function fetchAssignments() {
    const res = await fetch("/api/student/assignments");
    const data = await res.json();
    if (Array.isArray(data)) setAssignments(data);
  }

  // generate consistent color per subject
  function subjectColor(name?: string) {
    if (!name) return "bg-gray-400";
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-red-500",
      "bg-indigo-500",
      "bg-orange-500",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-8">
      <h1 className="text-2xl font-light text-gray-700">
        📚 Assignments Dashboard
      </h1>

      <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {assignments.map((a, index) => (
          <motion.a
            key={a._id}
            href={`/student/assignments/${a._id}`}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition bg-white"
          >
            {/* HEADER BANNER */}
            <div className={`h-32 relative ${subjectColor(a.subjectId?.name)}`}>
              <div className="absolute top-3 right-3 text-white opacity-80">
                <MoreVertical size={18} />
              </div>

              <div className="absolute bottom-3 left-4 text-white">
                <p className="font-semibold text-lg leading-tight">
                  {a.subjectId?.name}
                </p>
                <p className="text-xs opacity-80">{a.subjectId?.className}</p>
              </div>
            </div>

            {/* BODY */}
            <div className="p-5 space-y-3">
              <h3 className="font-semibold text-gray-800 text-lg line-clamp-2">
                {a.title}
              </h3>

              <p className="text-sm text-gray-500 line-clamp-2">
                {a.description || "No description provided"}
              </p>

              {/* FOOTER ICONS */}
              <div className="flex items-center justify-between pt-3 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <FileText size={16} />
                  Assignment
                </div>

                {a.dueDate && (
                  <div className="flex items-center gap-1 text-red-500">
                    <CalendarDays size={14} />
                    {new Date(a.dueDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
