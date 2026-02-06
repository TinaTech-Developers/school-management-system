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

  return (
    <div className="w-full mx-auto p-4 space-y-10">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Registered Subjects */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          My Registered Subjects
        </h2>
        {mySubjects.length === 0 && (
          <p className="text-gray-500">No registered subjects yet.</p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {mySubjects.map((s) => (
            <div
              key={s._id}
              className="relative rounded-2xl border border-green-300 bg-linear-to-br from-green-50 to-white p-5 shadow-md"
            >
              <Link href={`/student/subjects/${s._id}`}>
                <div className="cursor-pointer hover:scale-[1.01] transition">
                  <h3 className="font-semibold text-gray-800">
                    {s.name}{" "}
                    {s.code && (
                      <span className="ml-2 text-sm text-gray-500">
                        ({s.code})
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Teacher: {s.teacher}
                  </p>
                  {s.isCompulsory && (
                    <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">
                      Compulsory
                    </span>
                  )}
                  <span className="absolute top-4 right-4 text-xs px-3 py-1 rounded-full bg-green-600 text-white font-semibold">
                    Registered
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Unregistered Subjects */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-4">
          Available Subjects
        </h2>
        {unregisteredSubjects.length === 0 && (
          <p className="text-gray-500">
            You are registered for all subjects 🎉
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {unregisteredSubjects.map((s) => {
            const id = s.subjectId._id;
            const isSelected = selected.includes(id);

            return (
              <label
                key={id}
                className={`
        relative group cursor-pointer overflow-hidden rounded-2xl border
        p-5 transition-all duration-300
        bg-linear-to-br from-white to-gray-50
        hover:shadow-xl hover:-translate-y-1
        ${
          isSelected ?
            "border-blue-600 ring-2 ring-blue-200 shadow-xl"
          : "border-gray-200"
        }
      `}
              >
                {/* Glow effect when selected */}
                {isSelected && (
                  <div className="absolute inset-0 bg-blue-500/5 pointer-events-none" />
                )}

                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggle(id)}
                  className="absolute top-4 right-4 h-5 w-5 accent-blue-600 z-10"
                />

                {/* Subject header */}
                <div className="flex items-start gap-3">
                  {/* Subject icon */}
                  <div
                    className={`
            flex h-11 w-11 items-center justify-center rounded-xl text-white font-bold
            ${isSelected ? "bg-blue-600" : "bg-gray-400"}
          `}
                  >
                    {s.subjectId.name.charAt(0)}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 leading-tight">
                      {s.subjectId.name}
                    </h3>

                    {s.subjectId.code && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        {s.subjectId.code}
                      </p>
                    )}
                  </div>
                </div>

                {/* Teacher */}
                <p className="mt-3 text-sm text-gray-600">
                  👨‍🏫 Teacher:{" "}
                  <span className="font-medium">
                    {s.teacherId?.name || "Not Assigned"}
                  </span>
                </p>

                {/* Footer tags */}
                <div className="mt-4 flex items-center justify-between">
                  {s.subjectId.isCompulsory && (
                    <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-600 font-medium">
                      Compulsory
                    </span>
                  )}

                  {isSelected && (
                    <span className="text-xs font-semibold text-blue-600">
                      ✓ Selected
                    </span>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </section>

      {/* Register Button */}
      {canRegister && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={submit}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl text-sm font-medium shadow-lg mt-4"
        >
          {loading ? "Registering..." : "Register Selected Subjects"}
        </motion.button>
      )}
    </div>
  );
}
