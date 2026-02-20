"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Student {
  _id: string;
  name: string;
}

interface ExamSubject {
  _id: string;
  subject: {
    _id: string;
    name: string;
  };
}

interface Class {
  _id: string;
  name: string;
}

export default function TeacherExamResultsPage() {
  const params = useParams();
  const examId =
    Array.isArray(params.examId) ? params.examId[0] : params.examId;

  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Record<string, number>>({});
  const [examSubjects, setExamSubjects] = useState<ExamSubject[]>([]);
  const [examSubjectId, setExamSubjectId] = useState("");

  const [classes, setClasses] = useState<Class[]>([]);
  const [classId, setClassId] = useState("");

  const [loadingStudents, setLoadingStudents] = useState(false);

  // =============================
  // LOAD Exam SUBJECTS
  // =============================
  useEffect(() => {
    if (!classId || !examId) return;

    fetch(`/api/teacher/exams/${examId}/exam-subjects?classId=${classId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setExamSubjects(data);
        else if (Array.isArray(data.data)) setExamSubjects(data.data);
      });
  }, [classId, examId]);

  // =============================
  // LOAD CLASSES
  // =============================
  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setClasses(data);
        else if (Array.isArray(data.classes)) setClasses(data.classes);
        else if (Array.isArray(data.data)) setClasses(data.data);
        else setClasses([]);
      })
      .catch(console.error);
  }, []);

  // =============================
  // LOAD STUDENTS (CLASS ONLY)
  // =============================
  useEffect(() => {
    if (!classId) {
      setStudents([]);
      return;
    }

    async function loadStudents() {
      setLoadingStudents(true);

      try {
        const res = await fetch(`/api/students?classId=${classId}`);
        const data = await res.json();

        console.log("STUDENTS:", data);

        if (Array.isArray(data)) {
          setStudents(data);
        } else if (Array.isArray(data.students)) {
          setStudents(data.students);
        } else if (Array.isArray(data.data)) {
          setStudents(data.data);
        } else {
          setStudents([]);
        }
      } catch (err) {
        console.error(err);
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    }

    setMarks({});
    loadStudents();
  }, [classId]);

  // =============================
  // MARKS CHANGE
  // =============================
  const handleChange = (studentId: string, value: string) => {
    setMarks((prev) => ({
      ...prev,
      [studentId]: Number(value),
    }));
  };

  // =============================
  // SAVE RESULTS
  // =============================
  const handleSubmit = async () => {
    if (!examSubjectId || !classId) {
      alert("Select class and subject");
      return;
    }

    const res = await fetch(`/api/teacher/exams/${examId}/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classId,
        examSubjectId,
        results: students.map((s) => ({
          studentId: s._id,
          marks: marks[s._id] || 0,
        })),
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Failed to save results");
      return;
    }

    alert("Results saved!");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 text-gray-600">
      <h1 className="text-3xl font-bold">Enter Exam Marks</h1>

      <div className="flex flex-wrap gap-4">
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="">Select Class</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={examSubjectId}
          onChange={(e) => setExamSubjectId(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="">Select Subject</option>
          {examSubjects.map((es) => (
            <option key={es._id} value={es._id}>
              {es.subject.name}
            </option>
          ))}
        </select>
      </div>

      {loadingStudents && <p>Loading students...</p>}

      <div className="border  shadow">
        <table className="w-full">
          <thead className="bg-gray-300">
            <tr>
              <th className="px-6 py-3 text-start">Student</th>
              <th className="px-6 py-3 text-start">Marks</th>
            </tr>
          </thead>

          <tbody>
            <AnimatePresence>
              {students.map((s, i) => (
                <motion.tr
                  key={s._id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <td className="px-6 py-4">{s.name}</td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      value={marks[s._id] || ""}
                      onChange={(e) => handleChange(s._id, e.target.value)}
                      className="border rounded px-2 py-1 w-24"
                    />
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg"
      >
        Save Results
      </motion.button>
    </div>
  );
}
