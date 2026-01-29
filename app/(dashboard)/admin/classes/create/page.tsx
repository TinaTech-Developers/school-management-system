"use client";

import { useEffect, useState, ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiSkipBack } from "react-icons/fi";

/* ======================================================
   UI COMPONENTS (LOCAL – SAME STYLE)
====================================================== */

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white border rounded-2xl shadow-sm">{children}</div>
  );
}

function CardContent({ children }: { children: ReactNode }) {
  return <div className="p-8 space-y-8">{children}</div>;
}

function Label({ children }: { children: ReactNode }) {
  return (
    <label className="text-sm font-medium text-gray-700">{children}</label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-lg border px-3 py-2 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border px-3 py-2 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">Select option</option>
      {children}
    </select>
  );
}

function SelectItem({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  return <option value={value}>{children}</option>;
}

function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost";
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
        variant === "primary" ?
          "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
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

interface Teacher {
  _id: string;
  name: string;
}

interface School {
  _id: string;
  name: string;
}

/* ======================================================
   PAGE
====================================================== */

export default function CreateClassPage() {
  const [name, setName] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [loading, setLoading] = useState(false);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schools, setSchools] = useState<School[]>([]);

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    fetch("/api/users?role=TEACHER")
      .then((r) => r.json())
      .then(setTeachers);

    fetch("/api/schools")
      .then((r) => r.json())
      .then(setSchools);
  }, []);

  /* ================= SUBMIT ================= */

  const submit = async () => {
    if (!name || !schoolId) {
      alert("Class name and school are required");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        schoolId,
        teacherId: teacherId || undefined,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      alert("Failed to create class");
      return;
    }

    alert("Class created successfully");

    setName("");
    setTeacherId("");
    setSchoolId("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-4xl"
      >
        <Card>
          <CardContent>
            {/* HEADER */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">
                  Create Class
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Create a new class and optionally assign a teacher
                </p>
              </div>

              <Link
                href="/admin/classes"
                className="flex items-center gap-2 bg-gray-500 hover:bg-gray-900 text-white px-3 py-2 rounded-lg text-sm"
              >
                <FiSkipBack />
                Back
              </Link>
            </div>

            {/* BASIC INFO */}
            <div className="space-y-5">
              <div>
                <Label>Class Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Grade 10 A"
                />
              </div>

              <div>
                <Label>School *</Label>
                <Select value={schoolId} onChange={setSchoolId}>
                  {schools.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            {/* ASSIGNMENT */}
            <div className="border-t pt-6 space-y-5">
              <h2 className="text-sm font-semibold text-gray-600 uppercase">
                Assignment
              </h2>

              <div>
                <Label>Class Teacher</Label>
                <Select value={teacherId} onChange={setTeacherId}>
                  <option value="">Unassigned</option>
                  {teachers.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </Select>
                <p className="text-xs text-gray-400 mt-1">
                  Teacher can be assigned later
                </p>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => history.back()}>
                Cancel
              </Button>
              <Button disabled={loading} onClick={submit}>
                {loading ? "Creating..." : "Create Class"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
