"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiX, FiPlus } from "react-icons/fi";

interface Fee {
  _id?: string;
  studentId: { _id: string; name: string };
  classId: { _id: string; name: string };
  amount: number;
  paidAmount: number;
  status: "PENDING" | "PARTIAL" | "PAID";
  paymentHistory: {
    amount: number;
    method: string;
    date: string;
    reference?: string;
  }[];
}

interface ModalProps {
  onClose: () => void;
  onSaved: () => void;
  fee?: Fee | null;
}

export default function Modal({ onClose, onSaved, fee }: ModalProps) {
  const [students, setStudents] = useState<{ _id: string; name: string }[]>([]);
  const [classes, setClasses] = useState<{ _id: string; name: string }[]>([]);
  const [studentId, setStudentId] = useState(fee?.studentId?._id || "");
  const [classId, setClassId] = useState(fee?.classId?._id || "");
  const [amount, setAmount] = useState(fee?.amount || 0);
  const [paidAmount, setPaidAmount] = useState(fee?.paidAmount || 0);
  const [paymentHistory, setPaymentHistory] = useState(
    fee?.paymentHistory || [],
  );
  const [loading, setLoading] = useState(false);

  /* ---------------- FETCH STUDENTS & CLASSES ---------------- */
  useEffect(() => {
    fetch("/api/users?role=STUDENT")
      .then((r) => r.json())
      .then(setStudents);

    fetch("/api/classes")
      .then((r) => r.json())
      .then(setClasses);
  }, []);

  /* ---------------- CALCULATE STATUS ---------------- */
  const status =
    paidAmount === 0 ? "PENDING"
    : paidAmount < amount ? "PARTIAL"
    : "PAID";

  /* ---------------- ADD PAYMENT ---------------- */
  const addPayment = () => {
    const payment = {
      amount: Number(prompt("Enter payment amount") || 0),
      method: prompt("Payment method (CASH/CARD/BANK)") || "CASH",
      date: new Date().toISOString(),
      reference: prompt("Reference (optional)") || "",
    };
    setPaymentHistory([...paymentHistory, payment]);
    setPaidAmount((prev) => prev + payment.amount);
  };

  /* ---------------- SUBMIT ---------------- */
  const submit = async () => {
    if (!studentId || !classId || !amount) {
      alert("Student, Class, and Amount are required");
      return;
    }

    setLoading(true);

    const payload = {
      studentId,
      classId,
      amount,
      paidAmount,
      status,
      paymentHistory,
    };

    const url = fee?._id ? `/api/fees/${fee._id}` : "/api/fees";
    const method = fee?._id ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) return alert("Failed to save fee");

    alert(fee?._id ? "Fee updated" : "Fee created");
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 relative"
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <FiX size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          {fee ? "Edit Fee" : "Add Fee"}
        </h2>

        {/* FORM */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Student *
            </label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1 text-gray-500"
            >
              <option value="">Select Student</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Class *
            </label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1 text-gray-500"
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 mt-1 text-gray-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-green-700">
              Paid Amount: ${paidAmount}
            </p>
            <button
              type="button"
              onClick={addPayment}
              className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
            >
              <FiPlus /> Add Payment
            </button>
          </div>

          {/* PAYMENT HISTORY */}
          {paymentHistory.length > 0 && (
            <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
              <h3 className="font-medium mb-2 text-gray-600">
                Payment History
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 border-b">
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((p, i) => (
                    <tr key={i} className="border-b last:border-none">
                      <td className="text-gray-500 text-center p-1">
                        {new Date(p.date).toLocaleDateString()}
                      </td>
                      <td className="text-gray-500 text-center p-1">
                        ${p.amount}
                      </td>
                      <td className="text-gray-500 text-center p-1">
                        {p.method}
                      </td>
                      <td className="text-gray-500 text-center p-1">
                        {p.reference || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* STATUS */}
          <p className="mt-2 text-sm">
            Status:{" "}
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                status === "PAID" ? "bg-green-100 text-green-600"
                : status === "PARTIAL" ? "bg-yellow-100 text-yellow-600"
                : "bg-red-100 text-red-600"
              }`}
            >
              {status}
            </span>
          </p>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ?
                "Saving..."
              : fee ?
                "Update Fee"
              : "Add Fee"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
