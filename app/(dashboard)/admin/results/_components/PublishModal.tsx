"use client";

import { useState } from "react";
import { Result } from "@/types/result";

interface Props {
  result: Result;
  onSaved: () => void;
  onClose: () => void;
}

export default function PublishModal({ result, onSaved, onClose }: Props) {
  const [loading, setLoading] = useState(false);

  const togglePublish = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/results/${result._id}/publish`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publish: !result.published }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to update");
        return;
      }
      onSaved();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const res = await fetch(`/api/results/${result._id}/report`, {
        method: "GET",
      });
      if (!res.ok) throw new Error("Failed to download PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${result.studentId.name}_ReportCard.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[400px] p-6 space-y-4">
        <h2 className="text-lg font-semibold">Result Actions</h2>

        <p>
          Student: <strong>{result.studentId.name}</strong>
        </p>
        <p>
          Exam: <strong>{result.examId.name}</strong> ({result.examId.term}{" "}
          {result.examId.year})
        </p>
        <p>
          Subject: <strong>{result.examSubjectId.name}</strong>
        </p>

        <div className="flex gap-2 mt-4">
          <button
            onClick={togglePublish}
            disabled={loading}
            className={`px-4 py-2 rounded ${
              result.published ?
                "bg-red-600 text-white"
              : "bg-green-600 text-white"
            }`}
          >
            {result.published ? "Unpublish" : "Publish"}
          </button>

          <button
            onClick={downloadPDF}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Download PDF
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded border text-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
