"use client";

import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { motion } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";

interface ClassSubject {
  _id: string;
  subjectId: {
    _id: string;
    name: string;
    code?: string;
    isCompulsory?: boolean;
  };
  teacherId?: { name: string };
}

interface MySubject {
  _id: string;
  name: string;
  code?: string;
  isCompulsory?: boolean;
  teacher: string;
}

export default function StudentSubjectsPage() {
  const [availableSubjects, setAvailableSubjects] = useState<ClassSubject[]>(
    [],
  );
  const [mySubjects, setMySubjects] = useState<MySubject[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const registeredIds = new Set(mySubjects.map((s) => s._id));
  const unregisteredSubjects = availableSubjects.filter(
    (s) => !registeredIds.has(s.subjectId._id),
  );

  const canRegister = selected.length > 0;

  useEffect(() => {
    fetchMySubjects();
    fetchAvailableSubjects();
  }, []);

  const fetchMySubjects = async () => {
    try {
      const res = await fetch("/api/student/my-subjects");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMySubjects(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load registered subjects");
    }
  };

  const fetchAvailableSubjects = async () => {
    try {
      const res = await fetch("/api/student/subjects");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAvailableSubjects(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load subjects");
    }
  };

  const toggle = (subjectId: string) => {
    setSelected((prev) =>
      prev.includes(subjectId) ?
        prev.filter((id) => id !== subjectId)
      : [...prev, subjectId],
    );
  };

  const submit = async () => {
    if (selected.length === 0) {
      toast.error("Please select at least one subject");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/student/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectIds: selected }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Registration failed");
      } else {
        toast.success("Subjects registered successfully 🎉");
        setSelected([]);
        fetchMySubjects();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // 🎨 SUBJECT THEMES
  const getSubjectTheme = (name: string) => {
    const n = name.toLowerCase();

    if (n.includes("chem")) {
      return {
        gradient: "from-purple-600 to-pink-500",
        overlay: "bg-purple-900/30",
        icon: "⚗️ 🧪  ",
      };
    }

    if (n.includes("math")) {
      return {
        gradient: "from-blue-600 to-cyan-500",
        overlay: "bg-blue-900/30",
        icon: "📐 ♾️",
      };
    }

    if (n.includes("computer") || n.includes("ict")) {
      return {
        gradient: "from-gray-800 to-gray-600",
        overlay: "bg-black/40",
        icon: "💻 👨‍💻",
      };
    }

    if (n.includes("physics")) {
      return {
        gradient: "from-indigo-600 to-blue-500",
        overlay: "bg-indigo-900/30",
        icon: "🧲 ⚛️",
      };
    }

    if (n.includes("biology")) {
      return {
        gradient: "from-green-600 to-emerald-500",
        overlay: "bg-green-900/30",
        icon: "🧬 👨‍🔬",
      };
    }

    return {
      gradient: "from-orange-500 to-red-500",
      overlay: "bg-black/30",
      icon: "📘",
    };
  };

  return (
    <div className="w-full mx-auto p-4 space-y-">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* REGISTERED SUBJECTS */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          My Registered Subjects
        </h2>

        {mySubjects.length === 0 && (
          <p className="text-gray-500 text-sm">No registered subjects yet.</p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mySubjects.map((s) => {
            const theme = getSubjectTheme(s.name);

            return (
              <Link key={s._id} href={`/student/subjects/${s._id}`}>
                <div className="cursor-pointer rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition">
                  <div
                    className={`relative h-36 bg-linear-to-br ${theme.gradient} flex items-center justify-center`}
                  >
                    <div className={`absolute inset-0 ${theme.overlay}`} />
                    <span className="relative text-5xl text-white">
                      {theme.icon}
                    </span>

                    <span className="absolute top-4 right-4 text-xs px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-md">
                      Registered
                    </span>
                  </div>

                  <div className="bg-white p-4">
                    <h3 className="font-bold text-gray-800">{s.name}</h3>

                    {s.code && (
                      <p className="text-sm text-gray-500">{s.code}</p>
                    )}

                    <p className="text-sm text-gray-600 mt-2">👨‍🏫 {s.teacher}</p>

                    {s.isCompulsory && (
                      <span className="inline-block mt-3 text-xs px-3 py-1 rounded-full bg-red-100 text-red-600 font-semibold">
                        Compulsory
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* AVAILABLE SUBJECTS */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Available Subjects
        </h2>

        {unregisteredSubjects.length === 0 && (
          <p className="text-gray-500 text-sm">
            You are registered for all subjects 🎉
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {unregisteredSubjects.map((s) => {
            const id = s.subjectId._id;
            const isSelected = selected.includes(id);
            const theme = getSubjectTheme(s.subjectId.name);

            return (
              <label
                key={id}
                className={`relative cursor-pointer rounded-2xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                  isSelected ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggle(id)}
                  className="absolute top-4 right-4 h-5 w-5 accent-white z-20"
                />

                <div
                  className={`relative h-40 bg-gradient-to-br ${theme.gradient} flex items-center justify-center`}
                >
                  <div className={`absolute inset-0 ${theme.overlay}`} />

                  <span className="relative text-6xl text-white drop-shadow-lg">
                    {theme.icon}
                  </span>

                  {s.subjectId.code && (
                    <span className="absolute bottom-3 left-4 text-xs bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full">
                      {s.subjectId.code}
                    </span>
                  )}
                </div>

                <div className="bg-white p-4 space-y-2">
                  <h3 className="text-lg font-bold text-gray-800">
                    {s.subjectId.name}
                  </h3>

                  <p className="text-sm text-gray-600">
                    👨‍🏫{" "}
                    <span className="font-medium">
                      {s.teacherId?.name || "Not Assigned"}
                    </span>
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    {s.subjectId.isCompulsory && (
                      <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-600 font-semibold">
                        Compulsory
                      </span>
                    )}

                    {isSelected && (
                      <span className="text-xs font-semibold text-blue-600">
                        ✓ Selected
                      </span>
                    )}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </section>

      {canRegister && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={submit}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl text-sm font-semibold shadow-lg"
        >
          {loading ? "Registering..." : "Register Selected Subjects"}
        </motion.button>
      )}
    </div>
  );
}
