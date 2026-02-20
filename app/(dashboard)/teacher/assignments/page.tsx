"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

interface Subject {
  _id: string;
  name: string;
  className: string;
}

interface Assignment {
  _id: string;
  title: string;
  description?: string;
  fileUrl?: string;
  dueDate?: string;
}

export default function TeacherAssignmentsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) fetchAssignments();
  }, [selectedSubject]);

  async function fetchSubjects() {
    try {
      const res = await fetch("/api/teacher/subjects");
      const data = await res.json();

      // ✅ Handle all possible API shapes
      if (Array.isArray(data)) {
        setSubjects(data);
      } else if (Array.isArray(data.subjects)) {
        setSubjects(data.subjects);
      } else {
        console.error("Subjects not array:", data);
        setSubjects([]);
      }
    } catch (err) {
      console.error("Fetch subjects error:", err);
      setSubjects([]);
    }
  }

  async function fetchAssignments() {
    try {
      const res = await fetch(
        `/api/teacher/assignments?subjectId=${selectedSubject}`,
      );

      const data = await res.json();

      // VERY IMPORTANT FIX 👇
      if (Array.isArray(data)) {
        setAssignments(data);
      } else if (Array.isArray(data.assignments)) {
        setAssignments(data.assignments);
      } else {
        console.error("Assignments not array:", data);
        setAssignments([]);
      }
    } catch (err) {
      console.error("Fetch assignments error:", err);
      setAssignments([]);
    }
  }

  async function submit() {
    if (!selectedSubject) return toast.error("Select subject");
    if (!form.title) return toast.error("Title required");

    setLoading(true);

    await fetch("/api/teacher/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        subjectId: selectedSubject,
        fileUrl,
      }),
    });

    toast.success("Assignment posted 🎉");

    setForm({ title: "", description: "", dueDate: "" });
    setFileUrl("");
    fetchAssignments();
    setLoading(false);
  }

  async function deleteAssignment(id: string) {
    await fetch(`/api/teacher/assignments?id=${id}`, {
      method: "DELETE",
    });
    fetchAssignments();
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-blue-600">
        📝 Assignments Manager
      </h1>

      <select
        value={selectedSubject}
        onChange={(e) => setSelectedSubject(e.target.value)}
        className="border p-2 rounded-xl w-full text-gray-700"
      >
        <option value="">Select Subject</option>
        {subjects.map((s) => (
          <option key={s._id} value={s._id}>
            {s.name} ({s.className})
          </option>
        ))}
      </select>

      {selectedSubject && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border p-6 rounded-2xl  bg-white shadow-lg space-y-4"
          >
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="border p-3 rounded-lg w-full text-gray-600"
            />

            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="border p-3 rounded-lg w-full text-gray-600"
            />

            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="border p-3 rounded-lg w-full text-gray-600"
            />

            <UploadButton<OurFileRouter, "materialUploader">
              endpoint="materialUploader"
              onClientUploadComplete={(res) => {
                setFileUrl(res[0].ufsUrl ?? res[0].url);
                toast.success("File uploaded 🎉");
              }}
              onUploadError={(error) => {
                toast.error(error.message);
              }}
              className="border-2 border-dashed border-blue-500 bg-gray-300"
            />

            <button
              onClick={submit}
              className="bg-blue-600 text-white p-3 rounded-lg w-full "
            >
              {loading ? "Posting..." : "Post Assignment"}
            </button>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assignments.map((a) => (
              <motion.div
                key={a._id}
                whileHover={{ scale: 1.03 }}
                className="border p-5 rounded-2xl shadow-md bg-white"
              >
                <h3 className="font-semibold text-lg text-gray-600">
                  {a.title}
                </h3>
                <p className="text-sm text-gray-500">{a.description}</p>

                {a.fileUrl && (
                  <a
                    href={a.fileUrl}
                    target="_blank"
                    className="text-blue-600 block mt-2"
                  >
                    📄 View Assignment
                  </a>
                )}

                {a.dueDate && (
                  <p className="text-xs mt-2 text-red-500">
                    Due: {new Date(a.dueDate).toLocaleDateString()}
                  </p>
                )}

                <button
                  onClick={() => deleteAssignment(a._id)}
                  className="text-red-600 mt-3"
                >
                  Delete
                </button>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
