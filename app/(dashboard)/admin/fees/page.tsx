"use client";

import { useEffect, useState, useMemo } from "react";
import { FiDownload, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Modal from "./_components/Modal"; // Reusable modal component
import { generateFinanceReport } from "../_components/financeReport";

/* ===================== TYPES ===================== */

interface Fee {
  _id: string;
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

/* ===================== MAIN COMPONENT ===================== */

export default function FeesDashboard() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal
  const [openModal, setOpenModal] = useState(false);
  const [editingFee, setEditingFee] = useState<Fee | null>(null);

  /* ---------------- FETCH FEES ---------------- */
  const loadFees = async () => {
    setLoading(true);
    const res = await fetch("/api/fees");
    const data = await res.json();
    setFees(data);
    setLoading(false);
  };

  useEffect(() => {
    loadFees();
  }, []);

  /* ---------------- FILTERED FEES ---------------- */
  const filteredFees = useMemo(
    () =>
      fees.filter((f) =>
        f.studentId.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [fees, search],
  );

  /* ---------------- SUMMARY STATS ---------------- */
  const stats = useMemo(() => {
    const today = new Date();
    const todayCollected = fees
      .map((f) =>
        f.paymentHistory
          .filter(
            (p) => new Date(p.date).toDateString() === today.toDateString(),
          )
          .reduce((s, p) => s + p.amount, 0),
      )
      .reduce((s, a) => s + a, 0);

    const monthCollected = fees
      .map((f) => f.paidAmount)
      .reduce((s, a) => s + a, 0);
    const pending = fees
      .map((f) => f.amount - f.paidAmount)
      .reduce((s, a) => s + a, 0);
    const overdue = fees.filter(
      (f) => f.status !== "PAID" && f.paidAmount < f.amount,
    ).length;

    return { today: todayCollected, month: monthCollected, pending, overdue };
  }, [fees]);

  /* ---------------- CHART DATA ---------------- */
  const revenueData = fees
    .slice(-6)
    .map((f, i) => ({ month: `Month ${i + 1}`, value: f.amount }));
  const collectionData = fees.slice(-6).map((f, i) => ({
    month: `Month ${i + 1}`,
    collected: f.paidAmount,
    pending: f.amount - f.paidAmount,
  }));

  /* ---------------- DELETE FEE ---------------- */
  const deleteFee = async (id: string) => {
    if (!confirm("Delete this fee record?")) return;
    await fetch(`/api/fees/${id}`, { method: "DELETE" });
    loadFees();
  };

  return (
    <div className="p-6  min-h-screen space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Fees & Bursary
          </h1>
          <p className="text-sm text-gray-500">
            Monitor payments, overdue invoices, and revenue trends
          </p>
        </div>
        <button
          onClick={() =>
            generateFinanceReport({
              fees,
              stats,
            })
          }
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
        >
          <FiDownload /> Generate Report
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Collected Today"
          value={stats.today}
          color="bg-teal-500"
        />
        <SummaryCard
          title="This Month"
          value={stats.month}
          color="bg-green-500"
        />
        <SummaryCard
          title="Pending"
          value={stats.pending}
          color="bg-yellow-400"
        />
        <SummaryCard
          title="Overdue Invoices"
          value={stats.overdue}
          color="bg-red-500"
        />
      </div>

      {/* DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHARTS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold text-gray-700 mb-4">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={revenueData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#14b8a6"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold text-gray-700 mb-4">
              Collection vs Pending
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={collectionData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="collected" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="#facc15" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* TRANSACTIONS */}
          {/*  here*/}
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold mb-4 text-gray-700">
              Reminders / Schedule
            </h3>
            <ScheduleItem title="Collect Fee Grade 10-A" time="09:00 - 10:00" />
            <ScheduleItem title="Bursary Approvals" time="11:00 - 12:30" />
            <ScheduleItem title="Finance Meeting" time="14:00 - 15:30" />
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className=" mb-4 text-gray-700 font-semibold">Calendar</h3>
            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className={`p-2 rounded-full ${
                    i === new Date().getDate() - 1 ?
                      "bg-teal-500 text-white"
                    : "text-gray-500"
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold mb-4 flex justify-between items-center text-gray-700">
          Recent Transactions
          <button
            onClick={() => {
              setEditingFee(null);
              setOpenModal(true);
            }}
            className="flex items-center gap-1 text-white bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 text-sm"
          >
            <FiPlus /> Add Fee
          </button>
        </h3>

        <input
          type="text"
          placeholder="Search by student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-2 px-3 py-2 border text-gray-600 rounded-lg"
        />

        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b">
              <th className="text-left py-2">Student</th>
              <th>Class</th>
              <th>Amount</th>
              <th>Paid</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFees.slice(-10).map((f) => {
              if (f.paymentHistory.length === 0) {
                // No payments yet
                return (
                  <tr key={f._id} className="border-b last:border-none">
                    <td className="text-start py-2 text-gray-600">
                      {f.studentId.name}
                    </td>
                    <td className="text-center py-2 text-gray-600">
                      {f.classId.name}
                    </td>
                    <td className="text-center py-2 text-gray-600">
                      ${f.amount}
                    </td>
                    <td className="text-center py-2 text-gray-600">$0</td>
                    <td className="text-center py-2 text-gray-600">
                      <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-600">
                        {f.status}
                      </span>
                    </td>
                    <td className="text-center">-</td>
                    <td className="flex justify-center py-2 gap-2">
                      <button
                        onClick={() => {
                          setEditingFee(f);
                          setOpenModal(true);
                        }}
                        className="text-blue-600"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => deleteFee(f._id)}
                        className="text-red-600"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                );
              }

              // If there are payments
              return f.paymentHistory.map((p, i) => (
                <tr key={f._id + i} className="border-b last:border-none ">
                  <td className=" py-4 text-gray-600">{f.studentId.name}</td>
                  <td className="text-center py-2 text-gray-600">
                    {f.classId.name}
                  </td>
                  <td className="text-center py-2 text-gray-600">
                    ${f.amount}
                  </td>
                  <td className="text-center py-2 text-gray-600">
                    ${p.amount}
                  </td>
                  <td className="text-center py-2 text-gray-600">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        f.status === "PAID" ? "bg-green-100 text-green-600"
                        : f.status === "PARTIAL" ?
                          "bg-yellow-100 text-yellow-600"
                        : "bg-red-100 text-red-600"
                      }`}
                    >
                      {f.status}
                    </span>
                  </td>
                  <td className="text-center text-gray-600">
                    {new Date(p.date).toLocaleDateString()}
                  </td>
                  <td className="flex justify-center gap-2 py-4">
                    <button
                      onClick={() => {
                        setEditingFee(f);
                        setOpenModal(true);
                      }}
                      className="text-blue-600"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => deleteFee(f._id)}
                      className="text-red-600"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL FOR ADD / EDIT FEE */}
      {openModal && (
        <Modal
          onClose={() => setOpenModal(false)}
          onSaved={loadFees}
          fee={editingFee}
        />
      )}
    </div>
  );
}

/* -------------------- COMPONENTS -------------------- */

function SummaryCard({ title, value, color }: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full ${color}`} />
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-lg font-semibold text-gray-400">${value}</p>
      </div>
    </div>
  );
}

function ScheduleItem({ title, time }: any) {
  return (
    <div className="border-l-4 border-teal-500 pl-3 mb-3">
      <p className="text-sm font-medium text-gray-400">{title}</p>
      <p className="text-xs text-gray-500">{time}</p>
    </div>
  );
}
