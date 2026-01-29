"use client";

import { useEffect, useState, ReactNode } from "react";
import { motion } from "framer-motion";

/* ======================================================
   UI COMPONENTS (LOCAL)
====================================================== */

function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white border rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function CardContent({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-lg border px-3 py-2 text-gray-600 text-sm outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border px-3 py-2 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">All</option>
      {children}
    </select>
  );
}

function Button({
  children,
  onClick,
  variant = "primary",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium ${
        variant === "primary" ?
          "bg-blue-600 text-white hover:bg-blue-700"
        : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

/* ======================================================
   TYPES
====================================================== */

interface Subject {
  _id: string;
  name: string;
  code?: string;
  classId?: string;
  teacherId?: string;
  isCompulsory: boolean;
  status?: "ACTIVE" | "ARCHIVED";
}

/* ======================================================
   PAGE
====================================================== */

export default function SubjectsDashboard() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [search, setSearch] = useState("");
  const [filterCompulsory, setFilterCompulsory] = useState("");

  const [classNames, setClassNames] = useState<Record<string, string>>({});
  const [teacherNames, setTeacherNames] = useState<Record<string, string>>({});

  /* ---------------- FETCH SUBJECTS ---------------- */

  useEffect(() => {
    fetch("/api/subjects")
      .then((res) => res.json())
      .then(setSubjects)
      .catch(console.error);
  }, []);

  /* ---------------- HELPERS ---------------- */

  async function getClassName(id: string) {
    const res = await fetch(`/api/classes/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.name as string;
  }

  async function getTeacherName(id: string) {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.name as string;
  }

  /* ---------------- LOAD CLASS & TEACHER NAMES ---------------- */

  useEffect(() => {
    if (!subjects.length) return;

    const loadNames = async () => {
      const classMap: Record<string, string> = {};
      const teacherMap: Record<string, string> = {};

      const classIds = Array.from(
        new Set(subjects.map((s) => s.classId).filter(Boolean)),
      ) as string[];

      const teacherIds = Array.from(
        new Set(subjects.map((s) => s.teacherId).filter(Boolean)),
      ) as string[];

      await Promise.all([
        ...classIds.map(async (id) => {
          const name = await getClassName(id);
          if (name) classMap[id] = name;
        }),
        ...teacherIds.map(async (id) => {
          const name = await getTeacherName(id);
          if (name) teacherMap[id] = name;
        }),
      ]);

      setClassNames(classMap);
      setTeacherNames(teacherMap);
    };

    loadNames();
  }, [subjects]);

  /* ---------------- FILTERING ---------------- */

  const filtered = subjects.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (filterCompulsory === "yes" && !s.isCompulsory) return false;
    if (filterCompulsory === "no" && s.isCompulsory) return false;
    return true;
  });

  /* ---------------- DELETE ---------------- */

  const handleDelete = (id: string) => async () => {
    if (!confirm("Delete this subject?")) return;
    await fetch(`/api/subjects/${id}`, { method: "DELETE" });
    setSubjects((prev) => prev.filter((s) => s._id !== id));
  };

  /* ======================================================
     RENDER
  ====================================================== */

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Subjects</h1>
          <p className="text-sm text-gray-500">
            Manage subjects, classes, and assigned teachers
          </p>
        </div>

        <Button
          onClick={() => (window.location.href = "/admin/subjects/create")}
        >
          + New Subject
        </Button>
      </div>

      {/* FILTERS */}
      <Card>
        <CardContent className="p-4 flex gap-4">
          <Input
            placeholder="Search subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select value={filterCompulsory} onChange={setFilterCompulsory}>
            <option value="yes">Compulsory</option>
            <option value="no">Optional</option>
          </Select>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">Subject</th>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Class</th>
                <th className="px-4 py-3 text-left">Teacher</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((s) => (
                <tr key={s._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">
                    {s.name}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{s.code || "-"}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {s.classId ? (classNames[s.classId] ?? "Loading...") : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {s.teacherId ?
                      (teacherNames[s.teacherId] ?? "Loading...")
                    : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        s.isCompulsory ?
                          "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {s.isCompulsory ? "Compulsory" : "Optional"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() =>
                        (window.location.href = `/admin/subjects/${s._id}`)
                      }
                    >
                      Edit
                    </Button>
                    <Button variant="ghost" onClick={handleDelete(s._id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No subjects found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
