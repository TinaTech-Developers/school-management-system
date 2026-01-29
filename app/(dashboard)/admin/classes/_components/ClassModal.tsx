"use client";

import { useEffect, useState } from "react";

interface Props {
  onClose: () => void;
  onSaved: () => void;
  editing?: any;
}

export default function ClassModal({ onClose, onSaved, editing }: Props) {
  const [name, setName] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/users?role=teacher")
      .then((r) => r.json())
      .then(setTeachers);

    fetch("/api/schools")
      .then((r) => r.json())
      .then(setSchools);

    if (editing) {
      setName(editing.name);
      setTeacherId(editing.teacherId?._id || "");
      setSchoolId(editing.schoolId?._id || "");
    }
  }, [editing]);

  const save = async () => {
    setSaving(true);

    const payload = { name, teacherId, schoolId };

    await fetch(editing ? `/api/classes/${editing._id}` : "/api/classes", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">
          {editing ? "Edit Class" : "New Class"}
        </h2>

        <div className="space-y-3">
          <input
            placeholder="Class name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />

          <select
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">Select teacher</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>

          <select
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">Select school</option>
            {schools.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
