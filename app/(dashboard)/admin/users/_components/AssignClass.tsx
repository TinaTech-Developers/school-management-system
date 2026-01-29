"use client";

import { useState, useEffect } from "react";
import { User } from "../page";

interface Props {
  student: User;
  onClose: () => void;
  onAssigned: () => void;
}

export default function AssignClass({ student, onClose, onAssigned }: Props) {
  const [classes, setClasses] = useState<{ _id: string; name: string }[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch("/api/classes");
        const data = await res.json();
        setClasses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchClasses();
  }, []);

  const handleAssign = async () => {
    if (!selectedClass) return alert("Select a class");

    try {
      const res = await fetch("/api/admin/assign-student-to-class", {
        method: "POST",
        body: JSON.stringify({
          studentId: student._id,
          classId: selectedClass,
        }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        onAssigned();
        onClose();
      } else {
        alert(data.error || "Failed to assign class");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  if (loading) return <p>Loading classes...</p>;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center text-gray-700">
      <div className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-xl font-bold mb-4">
          Assign Class to {student.name}
        </h2>
        <select
          className="border p-2 w-full rounded mb-4"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">Select Class</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={handleAssign}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}
