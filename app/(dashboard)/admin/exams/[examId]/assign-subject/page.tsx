"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Item {
  _id: string;
  name?: string;
  title?: string;
}

/* ---------------- SEARCHABLE SELECT COMPONENT ---------------- */
function SearchableSelect({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: Item[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = items.filter((i) =>
    (i.name || i.title || "").toLowerCase().includes(query.toLowerCase()),
  );

  const selected = items.find((i) => i._id === value);

  return (
    <div className="relative text-gray-600">
      <label className="block text-sm font-medium mb-2">{label}</label>

      <input
        className="w-full border rounded-lg px-4 py-2.5"
        placeholder={`Search ${label}`}
        value={open ? query : selected?.name || selected?.title || ""}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onChange={(e) => setQuery(e.target.value)}
      />

      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg max-h-52 overflow-y-auto shadow">
          {filtered.length === 0 && <p className="p-3 text-sm">No results</p>}

          {filtered.map((item) => (
            <div
              key={item._id}
              className="px-4 py-2 cursor-pointer hover:bg-gray-50"
              onClick={() => {
                onChange(item._id);
                setOpen(false);
              }}
            >
              {item.name || item.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- PAGE ---------------- */
export default function AssignExamSubjectPage() {
  const { examId } = useParams();
  const router = useRouter();

  const [subjects, setSubjects] = useState<Item[]>([]);
  const [classes, setClasses] = useState<Item[]>([]);
  const [teachers, setTeachers] = useState<Item[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [form, setForm] = useState({
    classId: "",
    subjectId: "",
    teacherId: "",
    totalMarks: 100,
    passMarks: 40, // match backend
  });

  const [loading, setLoading] = useState(false);

  /* FETCH DATA */
  useEffect(() => {
    const loadData = async () => {
      const [subjectsRes, classesRes, teachersRes] = await Promise.all([
        fetch("/api/subjects"),
        fetch("/api/classes"),
        fetch("/api/users?role=TEACHER"),
      ]);

      const subjectsData = await subjectsRes.json();
      const classesData = await classesRes.json();
      const teachersData = await teachersRes.json();

      setSubjects(subjectsData);
      setClasses(classesData);
      setTeachers(teachersData);

      setLoadingData(false);
    };

    loadData();
  }, []);

  const submit = async () => {
    setLoading(true);

    const res = await fetch(`/api/admin/exams/${examId}/subjects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjects: [form] }), // wrap in array
    });

    setLoading(false);

    if (res.ok) {
      router.push(`/admin/exams/${examId}`);
    } else {
      const data = await res.json();
      alert(data.error || "Failed to assign subject");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 ">
      <div className="w-full mx-auto p-6">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-600">
            Assign Subject to Examination
          </h1>
          <p className="text-sm mt-1 text-gray-600">
            Link a class subject and teacher to this exam session
          </p>
        </div>

        <div className="bg-white border rounded-xl p-6 space-y-6">
          {loadingData && <p>Loading data...</p>}

          {!loadingData && (
            <>
              <SearchableSelect
                label="Class"
                items={classes}
                value={form.classId}
                onChange={(v) => setForm({ ...form, classId: v })}
              />

              <SearchableSelect
                label="Subject"
                items={subjects}
                value={form.subjectId}
                onChange={(v) => setForm({ ...form, subjectId: v })}
              />

              <SearchableSelect
                label="Teacher"
                items={teachers}
                value={form.teacherId}
                onChange={(v) => setForm({ ...form, teacherId: v })}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="number"
                  className="border rounded-lg px-4 py-2.5 text-gray-600"
                  value={form.totalMarks}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      totalMarks: Number(e.target.value),
                    })
                  }
                />

                <input
                  type="number"
                  className="border rounded-lg px-4 py-2.5 text-gray-600"
                  value={form.passMarks}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      passMarks: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Link
                  href={`/admin/exams/${examId}`}
                  className="px-4 py-2 border rounded-lg bg-red-500 text-white hover:bg-red-600"
                >
                  Cancel
                </Link>

                <button
                  disabled={loading}
                  onClick={submit}
                  className="px-5 py-2 rounded-lg bg-gray-900 text-white"
                >
                  {loading ? "Assigning..." : "Assign Subject"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
