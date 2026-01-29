"use client";

import { useState, useEffect, useMemo } from "react";
import { FiUpload, FiTrash2, FiEdit2 } from "react-icons/fi";
import LearningMaterialModal from "./_components/LearningMaterialModal";

interface Material {
  _id: string;
  title: string;
  description?: string;
  fileUrl?: string;
  fileType?: string;
  link?: string;
  classId: { _id: string; name: string };
  subjectId: { _id: string; name: string };
  uploadedBy: { _id: string; name: string };
  createdAt: string;
}

export default function LearningMaterialDashboard() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  /* ---------------- Fetch Materials ---------------- */
  const loadMaterials = async () => {
    const res = await fetch("/api/learning-materials");
    const data = await res.json();
    setMaterials(data);
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const filteredMaterials = useMemo(
    () =>
      materials.filter((m) =>
        m.title.toLowerCase().includes(search.toLowerCase()),
      ),
    [materials, search],
  );

  /* ---------------- Delete ---------------- */
  const deleteMaterial = async (id: string) => {
    if (!confirm("Delete this material?")) return;
    await fetch(`/api/learning-materials/${id}`, { method: "DELETE" });
    loadMaterials();
  };

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">
          Learning Materials
        </h1>
        <button
          onClick={() => {
            setEditingMaterial(null);
            setOpenModal(true);
          }}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
        >
          <FiUpload /> Upload Material
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by title..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border px-3 py-2 rounded mb-4 text-gray-500"
      />

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-500">
            <tr>
              <th className="text-left py-2 px-3">Title</th>
              <th>Class</th>
              <th>Subject</th>
              <th>Uploaded By</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterials.map((m) => (
              <tr
                key={m._id}
                className="border-b last:border-none text-gray-600"
              >
                <td className="py-2 px-3">{m.title}</td>
                <td className="text-center">{m.classId.name}</td>
                <td className="text-center">{m.subjectId.name}</td>
                <td className="text-center">{m.uploadedBy.name}</td>
                <td className="text-center">
                  {new Date(m.createdAt).toLocaleDateString()}
                </td>
                <td className="flex justify-center gap-2 py-2">
                  <button
                    onClick={() => {
                      setEditingMaterial(m);
                      setOpenModal(true);
                    }}
                    className="text-blue-600"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => deleteMaterial(m._id)}
                    className="text-red-600"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {openModal && (
        <LearningMaterialModal
          material={editingMaterial}
          onClose={() => setOpenModal(false)}
          onSaved={loadMaterials}
        />
      )}
    </div>
  );
}
