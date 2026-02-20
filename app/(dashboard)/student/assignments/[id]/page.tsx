"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import {
  FileText,
  CalendarDays,
  Download,
  BookOpen,
  Clock,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function AssignmentViewPage() {
  const { id } = useParams();
  const [assignment, setAssignment]: any = useState(null);

  useEffect(() => {
    fetch(`/api/student/assignments/${id}`)
      .then((r) => r.json())
      .then((d) => setAssignment(d));
  }, [id]);

  function subjectColor(name?: string) {
    if (!name) return "from-gray-500 to-gray-400";
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

  function dueStatus(date?: string) {
    if (!date) return null;
    const now = new Date();
    const due = new Date(date);
    const diff = due.getTime() - now.getTime();
    const days = diff / (1000 * 60 * 60 * 24);

    if (days < 0) return "bg-red-100 text-red-600 border border-red-200";
    if (days <= 3)
      return "bg-yellow-100 text-yellow-700 border border-yellow-200";
    return "bg-green-100 text-green-700 border border-green-200";
  }

  if (!assignment)
    return (
      <div className="p-10 text-center text-gray-500">
        Loading assignment...
      </div>
    );

  return (
    <div className="min-h-screen  p-2">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full mx-auto space-y-6"
      >
        {/* HERO HEADER */}
        <div
          className={`rounded-2xl p-8 text-white shadow-xl bg-gradient-to-r ${subjectColor(
            assignment.subjectId?.name,
          )}`}
        >
          <div className="flex items-center gap-3 mb-3 opacity-90">
            <BookOpen size={20} />
            <span className="text-sm">
              {assignment.subjectId?.name} • {assignment.subjectId?.className}
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">
            {assignment.title}
          </h1>

          {assignment.dueDate && (
            <div
              className={`mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${dueStatus(
                assignment.dueDate,
              )}`}
            >
              <Clock size={14} />
              Due {new Date(assignment.dueDate).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* CONTENT PANEL */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-7 space-y-6 border"
        >
          {/* DESCRIPTION */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <FileText size={18} />
              Assignment Details
            </div>

            <p className="text-gray-600 leading-relaxed">
              {assignment.description || "No description provided"}
            </p>
          </div>

          {/* FILE DOWNLOAD */}
          {assignment.fileUrl && (
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href={assignment.fileUrl}
              target="_blank"
              className="flex items-center justify-between p-4 rounded-xl border hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3 text-gray-700">
                <Download size={18} />
                Open Assignment File
              </div>

              <span className="text-xs text-gray-400">Click to view</span>
            </motion.a>
          )}

          {/* FOOTER META */}
          <div className="pt-4 border-t text-sm text-gray-500 flex justify-between">
            <span>Subject: {assignment.subjectId?.name}</span>

            {assignment.dueDate && (
              <span className="flex items-center gap-1 text-red-500">
                <CalendarDays size={14} />
                {new Date(assignment.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </motion.div>
        <Link
          href="/student/assignments"
          className="mt-4 bg-black shadow-xl left-5 bottom-5 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 hover:bg-gray-800 transition"
        >
          <ArrowLeft size={20} /> Back
        </Link>
      </motion.div>
    </div>
  );
}
