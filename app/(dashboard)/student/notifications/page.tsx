"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, AlertTriangle, CheckCircle, CreditCard } from "lucide-react";

interface Notification {
  _id: string;
  title: string;
  description: string;
  type: "INFO" | "WARNING" | "FEE" | "EXAM";
  category: "CLASS" | "SCHOOL"; // ✅ New category
  createdAt: string;
  read: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch notifications (dummy data for now)
  useEffect(() => {
    const dummy: Notification[] = [
      {
        _id: "1",
        title: "New Exam Scheduled",
        description: "Math exam has been scheduled for 12 Feb at 10:00 AM",
        type: "EXAM",
        category: "CLASS",
        createdAt: new Date().toISOString(),
        read: false,
      },
      {
        _id: "2",
        title: "Fee Payment Reminder",
        description: "Your school fees for January are still pending.",
        type: "FEE",
        category: "SCHOOL",
        createdAt: new Date().toISOString(),
        read: false,
      },
      {
        _id: "3",
        title: "Class Cancelled",
        description: "History class for Monday has been cancelled.",
        type: "WARNING",
        category: "CLASS",
        createdAt: new Date().toISOString(),
        read: true,
      },
      {
        _id: "4",
        title: "School Closed",
        description: "The school will be closed next Friday for maintenance.",
        type: "INFO",
        category: "SCHOOL",
        createdAt: new Date().toISOString(),
        read: false,
      },
    ];
    setNotifications(dummy);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const typeIcon = (type: Notification["type"]) => {
    switch (type) {
      case "INFO":
        return <CheckCircle className="text-blue-500" />;
      case "WARNING":
        return <AlertTriangle className="text-yellow-500" />;
      case "FEE":
        return <CreditCard className="text-green-500" />;
      case "EXAM":
        return <Bell className="text-red-500" />;
      default:
        return null;
    }
  };

  const classNotifications = notifications.filter(
    (n) => n.category === "CLASS",
  );
  const schoolNotifications = notifications.filter(
    (n) => n.category === "SCHOOL",
  );

  const renderNotifications = (items: Notification[]) => (
    <AnimatePresence>
      {items.map((n) => (
        <motion.div
          key={n._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          whileHover={{ scale: 1.02 }}
          className={`flex items-start gap-4 p-4 rounded-xl border ${
            n.read ?
              "bg-white border-gray-200"
            : "bg-blue-50 border-blue-300 shadow"
          } cursor-pointer`}
          onClick={() => markAsRead(n._id)}
        >
          <div className="mt-1">{typeIcon(n.type)}</div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800">{n.title}</p>
            <p className="text-sm text-gray-500 mt-1">{n.description}</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(n.createdAt).toLocaleString()}
            </p>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );

  return (
    <div className="w-full min-h-screen p-6 bg-gray-50 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">
            Stay up-to-date with your classes and school updates.
          </p>
        </div>
        <button
          onClick={markAllRead}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
        >
          Mark all as read
        </button>
      </div>

      {/* ================= CLASS NOTIFICATIONS ================= */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
          Class Notifications
        </h2>
        {classNotifications.length > 0 ?
          renderNotifications(classNotifications)
        : <p className="text-gray-400 text-sm italic mt-2">
            No class notifications
          </p>
        }
      </section>

      {/* ================= SCHOOL NOTIFICATIONS ================= */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
          School Notifications
        </h2>
        {schoolNotifications.length > 0 ?
          renderNotifications(schoolNotifications)
        : <p className="text-gray-400 text-sm italic mt-2">
            No school notifications
          </p>
        }
      </section>
    </div>
  );
}
