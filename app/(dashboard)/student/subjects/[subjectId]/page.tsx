"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

  if (loading) return <p className="p-6">Loading subject...</p>;

  if (!subject) return <p className="p-6">Subject not found.</p>;

  return (
    <div className="p-6 space-y-8">
      {/* Subject Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl border shadow-sm"
      >
        <h1 className="text-2xl font-bold text-blue-500">{subject.name}</h1>
        <p className="text-gray-500 mt-1">
          {subject.code} • {subject.className}
        </p>

        <p className="text-sm mt-2 text-gray-600">
          👨‍🏫 Teacher: {subject.teacher}
        </p>

        {subject.isCompulsory && (
          <span className="inline-block mt-3 text-xs px-3 py-1 rounded-full bg-red-100 text-red-600">
            Compulsory
          </span>
        )}
      </motion.div>

      {/* Learning Materials */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-blue-500">
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
              className="border rounded-xl p-5 bg-white shadow-sm"
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
                  className="text-blue-600 text-sm mt-3 block"
                >
                  📄 Download File
                </a>
              )}

              {m.link && (
                <a
                  href={m.link}
                  target="_blank"
                  className="text-green-600 text-sm mt-2 block"
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
