"use client";

import { useEffect, useState, ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiSkipBack } from "react-icons/fi";

/* ======================================================
   UI COMPONENTS (LOCAL – REUSED)
====================================================== */

function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white border rounded-2xl shadow-sm  ${className}`}>
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

function Label({ children }: { children: ReactNode }) {
  return (
    <label className="text-sm font-medium text-gray-700">{children}</label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-lg border px-3 py-2 text-sm outline-none text-gray-600 focus:ring-2 focus:ring-blue-500"
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

function Checkbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
    />
  );
}

function Button({
  children,
  disabled,
  onClick,
  variant = "primary",
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
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

interface Class {
  _id: string;
  name: string;
}

interface Teacher {
  _id: string;
  name: string;
}

/* ======================================================
   PAGE
====================================================== */

export default function CreateSubjectPage() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [classId, setClassId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [isCompulsory, setIsCompulsory] = useState(false);
  const [loading, setLoading] = useState(false);

  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then(setClasses);
    fetch("/api/users?role=TEACHER")
      .then((res) => res.json())
      .then(setTeachers);
  }, []);

  const submit = async () => {
    if (!name || !classId || !teacherId) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        code,
        classId,
        teacherId,
        isCompulsory,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      alert("Failed to create subject");
      return;
    }

    alert("Subject created successfully");
    setName("");
    setCode("");
    setClassId("");
    setTeacherId("");
    setIsCompulsory(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-5xl"
      >
        <Card>
          <CardContent className="p-8 space-y-8">
            {/* HEADER */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">
                  Create Subject
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Define subject details and assign it to a class and teacher
                </p>
              </div>
              <Link
                className="flex items-center justify-center gap-2 text-white bg-gray-500 hover:bg-gray-900 px-3 py-2 rounded-lg text-sm"
                href="/admin/subjects"
              >
                <FiSkipBack />
                Back
              </Link>
            </div>

            {/* BASIC INFO */}
            <div className="space-y-5">
              <div>
                <Label>Subject Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mathematics"
                />
              </div>

              <div>
                <Label>Subject Code</Label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="MTH101"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Optional internal reference code
                </p>
              </div>
            </div>

            {/* ASSIGNMENT */}
            <div className="border-t pt-6 space-y-5">
              <h2 className="text-sm font-semibold text-gray-600 uppercase">
                Assignment
              </h2>

              <div>
                <Label>Class *</Label>
                <Select value={classId} onChange={setClassId}>
                  {classes.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div>
                <Label>Teacher *</Label>
                <Select value={teacherId} onChange={setTeacherId}>
                  {teachers.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            {/* SETTINGS */}
            <div className="border-t pt-6 space-y-4">
              <h2 className="text-sm font-semibold text-gray-600 uppercase">
                Settings
              </h2>

              <div className="flex items-center gap-3">
                <Checkbox checked={isCompulsory} onChange={setIsCompulsory} />
                <div>
                  <Label>Compulsory Subject</Label>
                  <p className="text-xs text-gray-400">
                    Students must take this subject
                  </p>
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => history.back()}>
                Cancel
              </Button>
              <Button disabled={loading} onClick={submit}>
                {loading ? "Creating..." : "Create Subject"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
