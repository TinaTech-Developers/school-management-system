"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Status = "PRESENT" | "ABSENT" | "LATE";

interface Student {
  _id: string;
  name: string;
}

export default function MarkRegisterPage() {
  const { slotId } = useParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, Status>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/teacher/register/${slotId}`)
      .then((r) => r.json())
      .then(setStudents);
  }, [slotId]);

  const submit = async () => {
    setSaving(true);

    await fetch("/api/teacher/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slotId,
        records: Object.entries(attendance).map(([studentId, status]) => ({
          studentId,
          status,
        })),
      }),
    });

    setSaving(false);
    alert("Register submitted successfully");
  };

  return (
    <div className="w-full space-y-6">
      <h1 className="text-2xl font-bold text-gray-700">Mark Register</h1>

      <table className="w-full border rounded">
        <thead className="bg-gray-200 text-sm">
          <tr>
            <th className="p-2 text-left text-gray-800">Student</th>
            <th className="p-2 text-center text-gray-800">Present</th>
            <th className="p-2 text-center text-gray-800">Absent</th>
            <th className="p-2 text-center text-gray-800">Late</th>
          </tr>
        </thead>

        <tbody>
          {students.map((s) => (
            <tr key={s._id} className="border-t">
              <td className="p-2 text-gray-600">{s.name}</td>

              {(["PRESENT", "ABSENT", "LATE"] as Status[]).map((status) => (
                <td key={status} className="text-center text-gray-600">
                  <input
                    type="radio"
                    name={s._id}
                    checked={attendance[s._id] === status}
                    onChange={() =>
                      setAttendance((a) => ({ ...a, [s._id]: status }))
                    }
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={submit}
        disabled={saving}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {saving ? "Saving..." : "Submit Register"}
      </button>
    </div>
  );
}
