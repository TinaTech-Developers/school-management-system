"use client";

import { useState, useEffect } from "react";
import { User } from "../page";

interface Props {
  parent: User;
  onClose: () => void;
  onAssigned: () => void;
}

export default function AssignParent({ parent, onClose, onAssigned }: Props) {
  const [students, setStudents] = useState<User[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch("/api/users?role=STUDENT");
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleAssign = async () => {
    if (!selectedStudents.length) {
      alert("Select at least one student");
      return;
    }

    setAssigning(true);
    try {
      const res = await fetch("/api/admin/assign-parent-to-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentId: parent._id, // Bernard (PARENT)
          studentIds: selectedStudents, // ✅ matches API
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to assign parent");
        return;
      }

      onAssigned();
      onClose();
    } catch (err) {
      alert("Network error");
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return <p className="p-4">Loading students...</p>;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center text-gray-700 z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">
          Assign Students to {parent.name}
        </h2>

        <div className="max-h-60 overflow-y-auto mb-4 border rounded p-2">
          {students.map((s) => (
            <label
              key={s._id}
              className="flex items-center gap-2 mb-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedStudents.includes(s._id)}
                onChange={() => toggleStudent(s._id)}
              />
              <span>
                {s.name}
                <span className="text-xs text-gray-500 ml-1">({s.email})</span>
              </span>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleAssign}
            disabled={assigning}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {assigning ? "Assigning..." : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
}
