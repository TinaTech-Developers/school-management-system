"use client";

import { useState, useEffect } from "react";
import Select from "react-select";

interface Option {
  value: string;
  label: string;
}

interface TimetableSlotForm {
  academicYear: string;
  term: "TERM_1" | "TERM_2" | "TERM_3";
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";
  startTime: string;
  endTime: string;
  room?: string;
}

export default function TimetableModal({
  slot,
  onClose,
  onSaved,
}: {
  slot?: any;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<TimetableSlotForm>({
    academicYear: slot?.academicYear || "2025/2026",
    term: slot?.term || "TERM_1",
    classId: slot?.classId?._id || "",
    subjectId: slot?.subjectId?._id || "",
    teacherId: slot?.teacherId?._id || "",
    dayOfWeek: slot?.dayOfWeek || "MON",
    startTime: slot?.startTime || "08:00",
    endTime: slot?.endTime || "09:00",
    room: slot?.room || "",
  });

  // 🔹 Options from API
  const [classes, setClasses] = useState<Option[]>([]);
  const [teachers, setTeachers] = useState<Option[]>([]);
  const [subjects, setSubjects] = useState<Option[]>([]);

  useEffect(() => {
    const loadOptions = async () => {
      const [cls, tch, sub] = await Promise.all([
        fetch("/api/classes").then((res) => res.json()),
        fetch("/api/users?role=TEACHER").then((res) => res.json()),
        fetch("/api/subjects").then((res) => res.json()),
      ]);

      setClasses(cls.map((c: any) => ({ value: c._id, label: c.name })));
      setTeachers(tch.map((t: any) => ({ value: t._id, label: t.name })));
      setSubjects(sub.map((s: any) => ({ value: s._id, label: s.name })));
    };
    loadOptions();
  }, []);

  const save = async () => {
    const method = slot ? "PUT" : "POST";
    const url = slot ? `/api/timetable/${slot._id}` : "/api/timetable";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Failed to save timetable slot");
      return;
    }

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[480px] p-6 space-y-4">
        <h2 className="font-semibold text-lg text-gray-800">
          {slot ? "Edit Timetable Slot" : "Add Timetable Slot"}
        </h2>

        {/* Academic Year */}
        <input
          placeholder="Academic Year (e.g. 2025/2026)"
          value={form.academicYear}
          onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />

        {/* Term */}
        <select
          value={form.term}
          onChange={(e) => setForm({ ...form, term: e.target.value as any })}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="TERM_1" className="text-gray-600">
            Term 1
          </option>
          <option value="TERM_2" className="text-gray-600">
            Term 2
          </option>
          <option value="TERM_3" className="text-gray-600">
            Term 3
          </option>
        </select>

        {/* Class */}
        <Select
          options={classes}
          value={classes.find((c) => c.value === form.classId)}
          onChange={(option) =>
            setForm({ ...form, classId: option?.value || "" })
          }
          placeholder="Select Class"
          isSearchable
          className="text-gray-600"
        />

        {/* Subject */}
        <Select
          options={subjects}
          value={subjects.find((s) => s.value === form.subjectId)}
          onChange={(option) =>
            setForm({ ...form, subjectId: option?.value || "" })
          }
          placeholder="Select Subject"
          isSearchable
          className="text-gray-600"
        />

        {/* Teacher */}
        <Select
          options={teachers}
          value={teachers.find((t) => t.value === form.teacherId)}
          onChange={(option) =>
            setForm({ ...form, teacherId: option?.value || "" })
          }
          placeholder="Select Teacher"
          isSearchable
          className="text-gray-600"
        />

        {/* Room */}
        <input
          placeholder="Room"
          value={form.room}
          onChange={(e) => setForm({ ...form, room: e.target.value })}
          className="w-full border px-3 py-2 rounded text-gray-600"
        />

        {/* Day & Time */}
        <div className="flex gap-2">
          <select
            value={form.dayOfWeek}
            onChange={(e) =>
              setForm({ ...form, dayOfWeek: e.target.value as any })
            }
            className="border px-3 py-2 rounded w-full text-gray-600"
          >
            <option>MON</option>
            <option>TUE</option>
            <option>WED</option>
            <option>THU</option>
            <option>FRI</option>
            <option>SAT</option>
          </select>

          <input
            type="time"
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            className="border px-3 py-2 rounded w-full text-gray-600"
          />

          <input
            type="time"
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            className="border px-3 py-2 rounded w-full text-gray-600"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3">
          <button onClick={onClose} className="px-3 py-2 text-gray-500">
            Cancel
          </button>
          <button
            onClick={save}
            className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
