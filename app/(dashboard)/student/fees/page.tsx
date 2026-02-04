"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, CheckCircle, AlertCircle, CreditCard } from "lucide-react";

interface Payment {
  amount: number;
  method: string;
  date: string;
  reference?: string;
}

interface Fee {
  _id: string;
  type: string;
  amount: number;
  paidAmount: number;
  status: "PAID" | "PARTIAL" | "PENDING";
  dueDate: string;
  paymentHistory: Payment[];
}

export default function StudentFeesPage() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Fee | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/student/fees/me");
        const data = await res.json();
        setFees(data);
      } catch (err) {
        console.error("Failed to fetch fees:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalAmount = fees.reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = fees.reduce((sum, f) => sum + f.paidAmount, 0);
  const totalPending = totalAmount - totalPaid;

  if (loading) return <p className="p-6 text-gray-500">Loading fees...</p>;

  return (
    <div className="space-y-10 p-6">
      {/* ================= SUMMARY CARDS ================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          {
            icon: <DollarSign className="text-green-600 w-10 h-10 mb-3" />,
            label: "Total Fees",
            value: totalAmount,
          },
          {
            icon: <CheckCircle className="text-blue-600 w-10 h-10 mb-3" />,
            label: "Paid",
            value: totalPaid,
          },
          {
            icon: <AlertCircle className="text-red-600 w-10 h-10 mb-3" />,
            label: "Pending",
            value: totalPending,
          },
        ].map((card, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -4, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
            className="p-6 bg-white rounded-2xl shadow flex flex-col items-center transition"
            transition={{ type: "spring", stiffness: 120 }}
          >
            {card.icon}
            <p className="text-gray-500 uppercase text-sm tracking-wide">
              {card.label}
            </p>
            <p className="text-3xl font-bold text-gray-900">
              ${card.value.toLocaleString()}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* ================= DETAILED FEES TABLE ================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow p-6"
      >
        <h2 className="text-2xl font-semibold mb-6 text-blue-500">
          Fee Details
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Fee Type",
                  "Amount",
                  "Paid",
                  "Pending",
                  "Due Date",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="py-3 px-4 text-gray-500 text-sm uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fees.map((fee, idx) => (
                <motion.tr
                  key={fee._id}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0px 5px 15px rgba(0,0,0,0.05)",
                  }}
                  transition={{ type: "spring", stiffness: 120 }}
                  onClick={() => setSelected(fee)}
                  className="cursor-pointer"
                >
                  <td className="py-3 px-4 font-medium">{fee.type}</td>
                  <td className="py-3 px-4 text-gray-700">
                    ${fee.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-green-600 font-semibold">
                    ${fee.paidAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-red-600 font-semibold">
                    ${(fee.amount - fee.paidAmount).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {new Date(fee.dueDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <motion.span
                      key={fee.status}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 150 }}
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        fee.status === "PAID" ?
                          "bg-linear-to-r from-green-200 to-green-400 text-green-800"
                        : fee.status === "PARTIAL" ?
                          "bg-linear-to-r from-yellow-200 to-yellow-400 text-yellow-800"
                        : "bg-linear-to-r from-red-200 to-red-400 text-red-800"
                      }`}
                    >
                      {fee.status}
                    </motion.span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ================= FEE DETAILS MODAL ================= */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl shadow-lg max-w-lg w-full p-6 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-blue-400">
                {selected.type} Fee
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-gray-500 text-sm">Total Amount</p>
                <p className="text-lg font-semibold text-gray-700">
                  ${selected.amount.toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-500 text-sm">Paid</p>
                <p className="text-lg font-semibold text-green-600">
                  ${selected.paidAmount.toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-500 text-sm">Pending</p>
                <p className="text-lg font-semibold text-red-600">
                  ${(selected.amount - selected.paidAmount).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-500 text-sm">Due Date</p>
                <p className="text-lg font-semibold text-gray-700">
                  {new Date(selected.dueDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <h4 className="font-semibold text-gray-700">Payment History</h4>
            {selected.paymentHistory.length ?
              <motion.ul
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.1 } },
                  hidden: {},
                }}
                className="max-h-48 overflow-y-auto divide-y divide-gray-100 border rounded-lg text-gray-500"
              >
                {selected.paymentHistory.map((p, i) => (
                  <motion.li
                    key={i}
                    variants={{
                      hidden: { opacity: 0, y: 5 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    className="p-3 text-sm"
                  >
                    <div>
                      Amount: <strong>${p.amount}</strong>
                    </div>
                    <div>
                      Method: <strong>{p.method}</strong>
                    </div>
                    <div>
                      Date:{" "}
                      <strong>{new Date(p.date).toLocaleDateString()}</strong>
                    </div>
                    {p.reference && (
                      <div>
                        Reference: <strong>{p.reference}</strong>
                      </div>
                    )}
                  </motion.li>
                ))}
              </motion.ul>
            : <p className="text-gray-400 text-sm italic">No payments yet.</p>}

            {selected.status !== "PAID" && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-4 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 animate-pulse"
              >
                <CreditCard className="w-5 h-5" /> Pay Now
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
