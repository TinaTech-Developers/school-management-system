"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, AlertTriangle, CheckCircle, CreditCard } from "lucide-react";

interface Notification {
  _id: string;
  title: string;
  message: string; // ✅ change
  type: "INFO" | "WARNING" | "FEE" | "EXAM";
  category: "CLASS" | "SCHOOL";
  createdAt: string;
  read: boolean;
  className?: string;
  subjectName?: string;
  userName?: string;
}
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  // Fetch notifications (dummy data for now)
  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await fetch("/api/student/notifications");
        const data = await res.json();

        // ✅ Always force array
        if (Array.isArray(data)) {
          setNotifications(data);
        } else if (Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        } else {
          setNotifications([]);
        }
      } catch (err) {
        console.error(err);
        setNotifications([]);
      }
    }

    loadNotifications();
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

  const classNotifications =
    Array.isArray(notifications) ?
      notifications.filter((n) => n.category === "CLASS")
    : [];
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
          onClick={() => setSelectedNotification(n)}
        >
          <div className="mt-1">{typeIcon(n.type)}</div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800">{n.title}</p>
            <p className="text-sm text-gray-500 mt-1">{n.message}</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(n.createdAt).toLocaleString()}
            </p>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );

  return (
    <div className="w-full min-h-screen p-2 bg-gray-50 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1 text-sm">
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
      <AnimatePresence>
        {selectedNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={() => setSelectedNotification(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white p-6 rounded-lg shadow-lg max-w-md w-full border border-blue-500"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 🔴 Close Button */}
              <button
                onClick={() => setSelectedNotification(null)}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              <h3 className="text-xl font-semibold mb-2 text-gray-700 pr-6">
                {selectedNotification.title}
              </h3>

              {selectedNotification.className && (
                <p className="text-sm text-gray-500">
                  Class: {selectedNotification.className}
                </p>
              )}

              {selectedNotification.subjectName && (
                <p className="text-sm text-gray-500">
                  Subject: {selectedNotification.subjectName}
                </p>
              )}

              <p className="mt-3 text-gray-700 text-sm">
                {selectedNotification.message}
              </p>

              <p className="text-xs text-gray-400 mt-4">
                {new Date(selectedNotification.createdAt).toLocaleString()}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
