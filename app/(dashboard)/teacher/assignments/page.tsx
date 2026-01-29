"use client";

import { useEffect, useState, FormEvent } from "react";
import { FiPlus, FiEdit2, FiX } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Subject {
  _id: string;
  name: string;
}

interface Assignment {
  _id: string;
  title: string;
  description?: string;
  subjectId: Subject;
  dueDate: string;
}

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<Assignment | null>(null);

  const fetchAssignments = async () => {
    const res = await fetch("/api/teacher/assignments");
    setAssignments(await res.json());
  };

  const fetchSubjects = async () => {
    const res = await fetch("/api/subjects");
    setSubjects(await res.json());
  };

  useEffect(() => {
    fetchAssignments();
    fetchSubjects();
  }, []);

  /* ================= ADD ================= */
  const addAssignment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const payload = {
      title: formData.get("title"),
      description: formData.get("description"),
      subjectId: formData.get("subjectId"),
      dueDate: formData.get("dueDate"),
    };

    const res = await fetch("/api/teacher/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return toast.error("Failed to create assignment");

    toast.success("Assignment created");
    fetchAssignments();
    setAddOpen(false);
    e.currentTarget.reset();
  };

  return (
    <div className="p-6 space-y-4 text-gray-700">
      <ToastContainer />

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Assignments</h2>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded"
        >
          <FiPlus /> New Assignment
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow divide-y">
        {assignments.length === 0 && (
          <p className="p-4 text-gray-500">No assignments yet</p>
        )}

        {assignments.map((a) => (
          <div
            key={a._id}
            className="p-4 flex justify-between hover:bg-indigo-50 transition"
          >
            <div>
              <p className="font-semibold">{a.title}</p>
              <p className="text-sm text-gray-500">
                Subject: {a.subjectId?.name}
              </p>
              <p className="text-xs text-gray-400">
                Due: {new Date(a.dueDate).toLocaleDateString()}
              </p>
            </div>

            <button
              onClick={() => setSelected(a)}
              className="flex items-center gap-1 text-indigo-600"
            >
              <FiEdit2 /> Edit
            </button>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {addOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => setAddOpen(false)}
              className="absolute top-3 right-3"
            >
              <FiX />
            </button>

            <h3 className="font-bold mb-4">New Assignment</h3>

            <form onSubmit={addAssignment} className="space-y-3">
              <input
                name="title"
                required
                placeholder="Assignment title"
                className="w-full border px-3 py-2 rounded"
              />

              <textarea
                name="description"
                placeholder="Description"
                className="w-full border px-3 py-2 rounded"
              />

              <select
                name="subjectId"
                required
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <input
                name="dueDate"
                type="date"
                required
                className="w-full border px-3 py-2 rounded"
              />

              <button className="w-full bg-indigo-600 text-white py-2 rounded">
                Save Assignment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
