"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface Material {
  _id: string;
  title: string;
  description?: string;
  fileUrl?: string;
  fileType?: string;
  link?: string;
  uploadedBy: string;
  createdAt: string;
}

export default function SubjectDetailsPage() {
  const { subjectId } = useParams();
  const router = useRouter();

  const [subject, setSubject] = useState<any>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/student/my-subjects/${subjectId}`);
        const data = await res.json();

        setSubject(data.subject);
        setMaterials(data.materials || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (subjectId) load();
  }, [subjectId]);

  const getSubjectTheme = (name: string) => {
    const n = name.toLowerCase();

    if (n.includes("chem")) {
      return {
        gradient: "from-purple-600 to-pink-500",
        overlay: "bg-purple-900/30",
        icon: "⚗️ 🧪",
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

  if (loading) return <p className="p-4 md:p-6">Loading subject...</p>;
  if (!subject) return <p className="p-4 md:p-6">Subject not found.</p>;

  const theme = getSubjectTheme(subject.name);

  return (
    <div className="p-2 md:p-6 space-y-8">
      {/* SUBJECT HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl overflow-hidden shadow-md border"
      >
        {/* Colored Top */}
        <div
          className={`relative bg-gradient-to-r ${theme.gradient} text-white p-6`}
        >
          <div className={`absolute inset-0 ${theme.overlay}`} />

          {/* Back Button */}
          <button
            onClick={() => router.push("/student/subjects")}
            className="relative mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg 
                       bg-white/20 backdrop-blur-md hover:bg-white/30 
                       transition text-sm font-medium"
          >
            {"<<"} Back
          </button>

          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{subject.name}</h1>
              <p className="text-white/80 mt-1 text-sm">
                {subject.code} • {subject.className}
              </p>
            </div>

            <div className="text-4xl">{theme.icon}</div>
          </div>
        </div>

        {/* White Bottom */}
        <div className="bg-white p-5">
          <p className="text-sm text-gray-600">👨‍🏫 Teacher: {subject.teacher}</p>

          {subject.isCompulsory && (
            <span className="inline-block mt-3 text-xs px-3 py-1 rounded-full bg-red-100 text-red-600 font-semibold">
              Compulsory
            </span>
          )}
        </div>
      </motion.div>

      {/* LEARNING MATERIALS */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Learning Materials
        </h2>

        {materials.length === 0 && (
          <p className="text-gray-500">No materials uploaded yet.</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {materials.map((m) => (
            <motion.div
              key={m._id}
              whileHover={{ y: -4 }}
              className="border rounded-xl p-5 bg-white shadow-sm hover:shadow-lg transition"
            >
              <h3 className="font-semibold text-gray-800">{m.title}</h3>

              {m.description && (
                <p className="text-sm text-gray-500 mt-1">{m.description}</p>
              )}

              <p className="text-xs mt-2 text-gray-400">
                Uploaded by {m.uploadedBy}
              </p>

              {m.fileUrl && (
                <a
                  href={m.fileUrl}
                  target="_blank"
                  className="text-blue-600 text-sm mt-3 block hover:underline"
                >
                  📄 Download File
                </a>
              )}

              {m.link && (
                <a
                  href={m.link}
                  target="_blank"
                  className="text-green-600 text-sm mt-2 block hover:underline"
                >
                  🔗 Open Resource
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
