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

interface Material {
  _id: string;
  title: string;
  description?: string;
  fileUrl?: string;
  link?: string;
  tags?: string[];
}

export default function TeacherMaterialsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [fileUrl, setFileUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    link: "",
    tags: "",
  });

  // fetch subjects
  useEffect(() => {
    fetchSubjects();
  }, []);

  // fetch materials whenever selectedSubject changes
  useEffect(() => {
    if (selectedSubject) fetchMaterials();
    else setMaterials([]);
  }, [selectedSubject]);

  async function fetchSubjects() {
    try {
      const res = await fetch("/api/teacher/subjects");
      if (!res.ok) throw new Error("Failed to fetch subjects");
      const data: Subject[] = await res.json();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load subjects");
    }
  }

  async function fetchMaterials() {
    try {
      const res = await fetch(
        `/api/teacher/learning-materials?subjectId=${selectedSubject}`,
      );
      if (!res.ok) throw new Error("Failed to fetch materials");
      const data: Material[] = await res.json();
      setMaterials(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load materials");
    }
  }

  async function submit() {
    if (!selectedSubject) return toast.error("Please select a subject first");
    if (!form.title.trim()) return toast.error("Title required");
    if (!fileUrl && !form.link)
      return toast.error("Upload a file or provide a link");

    setLoading(true);

    try {
      const res = await fetch("/api/teacher/learning-materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          link: form.link.trim(),
          subjectId: selectedSubject,
          fileUrl,
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      if (!res.ok) throw new Error("Failed to upload material");

      toast.success("Material uploaded 🎉");
      setForm({ title: "", description: "", link: "", tags: "" });
      setFileUrl("");
      fetchMaterials();
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function deleteMaterial(id: string) {
    try {
      await fetch(`/api/teacher/learning-materials/${id}`, {
        method: "DELETE",
      });
      toast.success("Material deleted");
      fetchMaterials();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <h1 className=" text-2xl text-blue-600 animate-fade-in">
        📚 Learning Materials Manager
      </h1>

      {/* SUBJECT SELECT */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="border px-3 py-2 rounded-sm w-1/4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        >
          <option value="">Select Subject</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name} ({s.className})
            </option>
          ))}
        </select>
      </motion.div>

      {selectedSubject && (
        <>
          {/* UPLOAD CARD */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="border rounded-2xl p-6 bg-white shadow-lg space-y-4"
          >
            <h2 className="text-2xl  text-blue-500">
              Upload Learning Material
            </h2>

            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="border p-3 rounded-xl w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />

            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="border p-3 rounded-xl w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />

            {/* UPLOAD BUTTON */}
            <UploadButton<OurFileRouter, "materialUploader">
              endpoint="materialUploader"
              onClientUploadComplete={(res) => {
                if (!res?.length) return;
                const url = res[0].ufsUrl ?? res[0].url;
                setFileUrl(url);
                toast.success("File uploaded 🎉");
              }}
              onUploadError={(error) => {
                toast.error(error.message);
              }}
              className="bg-gray-50 border-2 border-dashed border-blue-400 p-4 rounded-xl w-full text-center hover:bg-blue-50 transition"
            />

            <input
              placeholder="Tags (comma separated)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="border p-3 rounded-xl w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />

            <button
              onClick={submit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl w-full font-medium transition"
            >
              {loading ? "Uploading..." : "Upload Material"}
            </button>
          </motion.div>

          {/* MATERIALS LIST */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {materials.map((m, idx) => (
              <motion.div
                key={m._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="border rounded-2xl p-5 bg-white shadow-md hover:shadow-xl transition-all relative"
              >
                <h3 className="font-semibold text-lg text-blue-600">
                  {m.title}
                </h3>

                {m.description && (
                  <p className="text-gray-500 mt-2 text-sm">{m.description}</p>
                )}

                <div className="flex flex-wrap mt-3 gap-2">
                  {m.tags?.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {m.fileUrl && (
                  <a
                    href={m.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-sm mt-3 block font-medium hover:underline"
                  >
                    📄 Download File
                  </a>
                )}

                {m.link && (
                  <a
                    href={m.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 text-sm mt-2 block font-medium hover:underline"
                  >
                    🔗 Open Link
                  </a>
                )}

                <button
                  onClick={() => deleteMaterial(m._id)}
                  className="absolute top-3 right-3 text-red-600 hover:text-red-800 text-sm font-medium"
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
