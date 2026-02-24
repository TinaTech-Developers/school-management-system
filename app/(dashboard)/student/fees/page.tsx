"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CreditCard, DollarSign, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

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

type Filter = "ALL" | "PAID" | "PARTIAL" | "PENDING";

export default function StudentFeesDashboard() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [filter, setFilter] = useState<Filter>("ALL");

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

  if (loading)
    return <p className="p-6 text-gray-500 text-center">Loading fees...</p>;

  const filteredFees =
    filter === "ALL" ? fees : fees.filter((f) => f.status === filter);

  const totalAmount = filteredFees.reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = filteredFees.reduce((sum, f) => sum + f.paidAmount, 0);
  const totalPending = totalAmount - totalPaid;

  const chartData = filteredFees.map((f) => ({
    name: f.type,
    Paid: f.paidAmount,
    Pending: f.amount - f.paidAmount,
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard
          title="Total Fees"
          value={totalAmount}
          icon={<DollarSign />}
          color="blue"
        />
        <KpiCard
          title="Paid"
          value={totalPaid}
          icon={<CheckCircle />}
          color="green"
        />
        <KpiCard
          title="Pending"
          value={totalPending}
          icon={<AlertCircle />}
          color="red"
        />
      </div>
      {/* ================= FEES GRID ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFees.map((fee) => {
          const progress = Math.min(fee.paidAmount / fee.amount, 1) * 100;
          return (
            <motion.div
              key={fee._id}
              layout
              whileHover={{ scale: 1.03 }}
              onClick={() => setSelectedFee(fee)}
              className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer flex flex-col items-center transition"
            >
              {/* Fee Type & Status */}
              <div className="flex justify-between w-full mb-4 items-center">
                <h3 className="font-semibold text-gray-800 text-lg">
                  {fee.type}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    fee.status === "PAID" ? "bg-green-100 text-green-700"
                    : fee.status === "PARTIAL" ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                  }`}
                >
                  {fee.status}
                </span>
              </div>

              {/* Circular Progress */}
              <div className="relative w-24 h-24 mb-4">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    className="text-gray-200"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="44"
                    cx="48"
                    cy="48"
                  />
                  <circle
                    className={`${
                      fee.status === "PAID" ? "text-green-500"
                      : fee.status === "PARTIAL" ? "text-yellow-400"
                      : "text-red-500"
                    }`}
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 44}
                    strokeDashoffset={2 * Math.PI * 44 * (1 - progress / 100)}
                    r="44"
                    cx="48"
                    cy="48"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-sm font-semibold text-gray-800">
                    {Math.round(progress)}%
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="w-full grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                <div className="flex flex-col items-center">
                  <p className="font-semibold text-gray-800">
                    ${fee.amount.toLocaleString()}
                  </p>
                  <p>Total</p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="font-semibold text-green-600">
                    ${fee.paidAmount.toLocaleString()}
                  </p>
                  <p>Paid</p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="font-semibold text-red-600">
                    ${(fee.amount - fee.paidAmount).toLocaleString()}
                  </p>
                  <p>Pending</p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="font-semibold text-gray-800">
                    {new Date(fee.dueDate).toLocaleDateString()}
                  </p>
                  <p>Due</p>
                </div>
              </div>

              <button className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white py-1 rounded-full text-sm transition">
                View Details
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* ================= FILTER TABS ================= */}
      <div className="flex space-x-4 bg-gray-100 p-2 rounded-full w-max">
        {(["ALL", "PAID", "PARTIAL", "PENDING"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1 rounded-full text-sm transition ${
              filter === f ?
                "bg-blue-500 text-white"
              : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ================= CHART ================= */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Fees Overview
        </h2>
        {filteredFees.length ?
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Paid" stackId="a" fill="#34D399" />
              <Bar dataKey="Pending" stackId="a" fill="#F87171" />
            </BarChart>
          </ResponsiveContainer>
        : <p className="text-gray-500 text-center py-20">No fees to display</p>}
      </div>

      {/* ================= FEE DETAILS MODAL ================= */}
      {selectedFee && (
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
              <h3 className="text-2xl font-bold text-blue-500">
                {selectedFee.type} Fee
              </h3>
              <button
                onClick={() => setSelectedFee(null)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Info
                label="Total Amount"
                value={`$${selectedFee.amount.toLocaleString()}`}
              />
              <Info
                label="Paid"
                value={`$${selectedFee.paidAmount.toLocaleString()}`}
                color="green"
              />
              <Info
                label="Pending"
                value={`$${(selectedFee.amount - selectedFee.paidAmount).toLocaleString()}`}
                color="red"
              />
              <Info
                label="Due Date"
                value={new Date(selectedFee.dueDate).toLocaleDateString()}
              />
            </div>

            <h4 className="font-semibold text-gray-700">Payment History</h4>
            {selectedFee.paymentHistory.length ?
              <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 border rounded-lg text-gray-500">
                {selectedFee.paymentHistory.map((p, i) => (
                  <div key={i} className="p-3 text-sm">
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
                  </div>
                ))}
              </div>
            : <p className="text-gray-400 text-sm italic">No payments yet.</p>}

            {selectedFee.status !== "PAID" && (
              <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2">
                <CreditCard className="w-5 h-5" /> Pay Now
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

function KpiCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  const colorClass =
    color === "green" ? "text-green-500"
    : color === "red" ? "text-red-500"
    : "text-blue-500";
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-white rounded-xl shadow p-6 flex items-center space-x-4 transition"
    >
      <div
        className={`w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 ${colorClass}`}
      >
        {icon}
      </div>
      <div>
        <p className={`text-sm font-semibold ${colorClass}`}>{title}</p>
        <p className="text-xl font-bold text-gray-900">
          ${value.toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
}

function Info({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  const colorClass =
    color === "green" ? "text-green-600"
    : color === "red" ? "text-red-600"
    : "text-gray-700";
  return (
    <div className="space-y-1">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className={`text-lg font-semibold ${colorClass}`}>{value}</p>
    </div>
  );
}
