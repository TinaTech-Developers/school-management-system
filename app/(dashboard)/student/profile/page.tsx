"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, User, School, BookOpen, Edit3, X } from "lucide-react";

interface Subject {
  _id: string;
  name: string;
  code: string;
  isCompulsory: boolean;
  teacher: string;
  className: string;
}

interface StudentProfile {
  name: string;
  email: string;
  studentId: string;
  className: string;
  subjects: Subject[];
}

export default function StudentProfilePage() {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false); // toggle edit form
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  // Fetch student info
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch("/api/student/me");
        if (!res.ok) throw new Error("Failed to fetch student");

        const data = await res.json();

        setStudent({
          name: data.name,
          email: data.email,
          studentId: data._id,
          className: "N/A",
          subjects: [],
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchStudent();
  }, []);

  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!student) return;

      try {
        const res = await fetch("/api/student/my-subjects");
        if (!res.ok) throw new Error("Failed to fetch subjects");

        const data: Subject[] = await res.json();
        const className = data.length > 0 ? data[0].className || "N/A" : "N/A";

        setStudent((prev) =>
          prev ? { ...prev, subjects: data, className } : null,
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [student?.studentId]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!student)
    return <div className="p-10 text-center">Student not found</div>;

  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  // ✅ Handle Edit button click
  const openEdit = () => {
    setForm({ name: student.name, email: student.email, password: "" });
    setEditing(true);
  };

  const closeEdit = () => setEditing(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      // Only send password if the user typed something
      const body: any = { name: form.name, email: form.email };
      if (form.password && form.password.trim() !== "") {
        body.password = form.password;
      }

      const res = await fetch(`/api/users/${student.studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update");

      const updated = await res.json();
      setStudent((prev) =>
        prev ?
          {
            ...prev,
            name: updated.name,
            email: updated.email,
          }
        : null,
      );
      setEditing(false);
      setForm({ ...form, password: "" }); // clear password after update
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="w-full mx-auto pb-10 space-y-14">
        {/* ================= PROFILE HEADER ================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-green-700 p-10 shadow-xl"
        >
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top,white,transparent)]" />

          <div className="relative flex flex-col md:flex-row gap-8 items-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white text-blue-700 text-4xl font-bold shadow-xl">
              {initials}
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {student.name}
              </h1>
              <p className="text-white/90 text-lg font-semibold">
                {student.className}
              </p>
              <p className="text-sm text-white/80">
                Student ID: {student.studentId}
              </p>
            </div>

            <button
              onClick={openEdit}
              className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-3 text-sm text-white hover:bg-white/30 transition"
            >
              <Edit3 size={16} />
              Edit Profile
            </button>
          </div>
        </motion.div>

        {/* ================= STATS ================= */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Academic Overview
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<BookOpen />}
              label="Subjects"
              value={student.subjects.length}
            />
            <StatCard
              icon={<School />}
              label="Class"
              value={student.className}
            />
            <StatCard icon={<User />} label="Status" value="Active" />
            <StatCard icon={<Mail />} label="Email Verified" value="Yes" />
          </div>
        </section>

        {/* ================= ACADEMIC DETAILS ================= */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Academic Details
          </h2>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Student Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1 rounded-2xl border bg-white p-8 shadow-sm space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                Student Information
              </h3>

              <DetailRow label="Full Name" value={student.name} />
              <DetailRow label="Email" value={student.email} />
              <DetailRow label="Student ID" value={student.studentId} />
              <DetailRow label="Class" value={student.className} />
            </motion.div>

            {/* Subjects */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 rounded-2xl border bg-white p-8 shadow-sm space-y-5"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                Registered Subjects
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                {student.subjects.map((subject) => (
                  <div
                    key={subject._id}
                    className="flex items-center justify-between rounded-xl border px-5 py-4 bg-gray-50 hover:shadow-md transition"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-700">
                        {subject.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {subject.teacher}
                      </span>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-600 font-medium">
                      {subject.isCompulsory ? "Compulsory" : "Optional"}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      {/* ================= EDIT MODAL ================= */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-blue-500">
                Edit Profile
              </h2>
              <button onClick={closeEdit}>
                <X />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 border text-gray-600 p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 ">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 border text-gray-600 p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 ">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Keep black to keep current password"
                  className="mt-1 block w-full rounded-md border-gray-300 border text-gray-600 p-2"
                />
              </div>

              <button
                onClick={handleSubmit}
                className="w-full rounded-xl bg-blue-600 text-white py-2 font-semibold hover:bg-blue-700 transition"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

/* ================= COMPONENTS ================= */
function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="rounded-2xl border bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-3 border-b last:border-none">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value}</span>
    </div>
  );
}
