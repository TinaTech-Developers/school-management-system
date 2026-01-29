"use client";

import { useState, useEffect } from "react";

interface Props {
  material?: any; // existing material for edit
  onClose: () => void;
  onSaved: () => void;
}

export default function LearningMaterialModal({
  material,
  onClose,
  onSaved,
}: Props) {
  const [form, setForm] = useState({
    title: material?.title || "",
    description: material?.description || "",
    fileUrl: material?.fileUrl || "",
    fileType: material?.fileType || "pdf",
    link: material?.link || "",
    classId: material?.classId?._id || "",
    subjectId: material?.subjectId?._id || "",
    tags: material?.tags?.join(", ") || "",
  });

  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  /* ---------------- Fetch Classes & Subjects ---------------- */
  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then(setClasses);
    fetch("/api/subjects")
      .then((res) => res.json())
      .then(setSubjects);
  }, []);

  const save = async () => {
    const method = material ? "PUT" : "POST";
    const url =
      material ?
        `/api/learning-materials/${material._id}`
      : "/api/learning-materials";

    const body = {
      ...form,
      tags: form.tags.split(",").map((t: string) => t.trim()),
    };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Failed to save material");
      return;
    }

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 text-gray-600">
      <div className="bg-white rounded-xl w-[480px] p-6 space-y-4">
        <h2 className="font-semibold text-lg">
          {material ? "Edit Material" : "Add Learning Material"}
        </h2>

        {/* Title */}
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />

        {/* Description */}
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />

        {/* Class Dropdown */}
        <select
          value={form.classId}
          onChange={(e) => setForm({ ...form, classId: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Select Class</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Subject Dropdown */}
        <select
          value={form.subjectId}
          onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Select Subject</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* File Upload */}
        <input
          type="text"
          placeholder="File URL (PDF, Video link etc.)"
          value={form.fileUrl}
          onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />

        {/* Optional Link */}
        <input
          type="text"
          placeholder="Optional external link"
          value={form.link}
          onChange={(e) => setForm({ ...form, link: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />

        {/* Tags */}
        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-3 py-2 text-gray-500">
            Cancel
          </button>
          <button
            onClick={save}
            className="bg-teal-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
