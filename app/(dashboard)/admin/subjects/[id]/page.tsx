"use client";

import { useEffect, useState, ReactNode } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";

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
    <div className={`bg-white border rounded-2xl shadow-sm ${className}`}>
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
  onClick,
  variant = "primary",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
        variant === "primary" ? "bg-blue-600 text-white hover:bg-blue-700"
        : variant === "danger" ? "bg-red-600 text-white hover:bg-red-700"
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
  classId: string;
  teacherId: string;
  isCompulsory: boolean;
}

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

export default function SubjectDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [subject, setSubject] = useState<Subject | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/subjects/${id}`)
      .then((res) => res.json())
      .then(setSubject);
    fetch("/api/classes")
      .then((res) => res.json())
      .then(setClasses);
    fetch("/api/users?role=TEACHER")
      .then((res) => res.json())
      .then(setTeachers);
  }, [id]);

  const save = async () => {
    if (!subject) return;

    setLoading(true);

    const res = await fetch(`/api/subjects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subject),
    });

    setLoading(false);

    if (!res.ok) {
      alert("Failed to update subject");
      return;
    }

    alert("Subject updated");
    setEditing(false);
  };

  if (!subject) {
    return <div className="p-10 text-gray-500">Loading subject...</div>;
  }

  return (
    <div className="min-h-screen  p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-5xl mx-auto"
      >
        <Card>
          <CardContent className="p-8 space-y-8">
            {/* HEADER */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">
                  {subject.name}
                </h1>
                <p className="text-sm text-gray-500">
                  Subject details and configuration
                </p>
              </div>

              {!editing ?
                <Button onClick={() => setEditing(true)}>Edit</Button>
              : <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={save}>
                    {loading ? "Saving..." : "Save"}
                  </Button>
                </div>
              }
            </div>

            {/* FORM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Subject Name</Label>
                <Input
                  disabled={!editing}
                  value={subject.name}
                  onChange={(e) =>
                    setSubject({ ...subject, name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Subject Code</Label>
                <Input
                  disabled={!editing}
                  value={subject.code || ""}
                  onChange={(e) =>
                    setSubject({ ...subject, code: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Class</Label>
                <Select
                  value={subject.classId}
                  onChange={(v) => setSubject({ ...subject, classId: v })}
                >
                  {classes.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div>
                <Label>Teacher</Label>
                <Select
                  value={subject.teacherId}
                  onChange={(v) => setSubject({ ...subject, teacherId: v })}
                >
                  {teachers.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            {/* SETTINGS */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={subject.isCompulsory}
                  onChange={(v) => setSubject({ ...subject, isCompulsory: v })}
                />
                <Label>Compulsory subject</Label>
              </div>
            </div>

            {/* FOOTER */}
            <div className="border-t pt-6 flex justify-between">
              <Button variant="ghost" onClick={() => router.back()}>
                Back
              </Button>
              <Button variant="danger">Delete Subject</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
