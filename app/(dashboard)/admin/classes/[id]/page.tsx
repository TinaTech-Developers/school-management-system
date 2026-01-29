"use client";

import { useEffect, useState, ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FiSkipBack } from "react-icons/fi";

/* ======================================================
   UI COMPONENTS (SAME STYLE)
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

interface Class {
  _id: string;
  name: string;
  teacherId?: { _id: string };
  schoolId?: { _id: string };
}

/* ======================================================
   PAGE
====================================================== */

export default function EditClassPage() {
  const { id } = useParams();
  const router = useRouter();

  const [name, setName] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [loading, setLoading] = useState(false);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    async function loadData() {
      const [classRes, teacherRes, schoolRes] = await Promise.all([
        fetch(`/api/classes/${id}`),
        fetch("/api/users?role=TEACHER"),
        fetch("/api/schools"),
      ]);

      const cls: Class = await classRes.json();
      setName(cls.name);
      setTeacherId(cls.teacherId?._id || "");
      setSchoolId(cls.schoolId?._id || "");

      setTeachers(await teacherRes.json());
      setSchools(await schoolRes.json());

      setInitialLoading(false);
    }

    loadData();
  }, [id]);

  /* ================= SUBMIT ================= */

  const submit = async () => {
    if (!name || !schoolId) {
      alert("Class name and school are required");
      return;
    }

    setLoading(true);

    const res = await fetch(`/api/classes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        schoolId,
        teacherId: teacherId || null,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      alert("Failed to update class");
      return;
    }

    router.push("/admin/classes");
  };

  if (initialLoading) {
    return (
      <div className="p-10 text-center text-sm text-gray-500">
        Loading class...
      </div>
    );
  }

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
                  Edit Class
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Update class details and assignments
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
                <Input value={name} onChange={(e) => setName(e.target.value)} />
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
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button disabled={loading} onClick={submit}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
