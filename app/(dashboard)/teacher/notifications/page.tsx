"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  Send,
} from "lucide-react";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "INFO" | "WARNING" | "FEE" | "EXAM";
  category: "CLASS" | "SCHOOL";
  createdAt: string;
  read: boolean;
  className?: string;
  subjectName?: string;
  userName?: string;
}

interface ClassOption {
  _id: string;
  name: string;
}

interface SubjectOption {
  _id: string;
  name: string;
}

export default function TeacherNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<Notification["type"]>("INFO");
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  // Fetch classes
  useEffect(() => {
    fetch("/api/classes")
      .then((res) => res.json())
      .then((data) =>
        setClasses(
          Array.isArray(data) ? data : data.classes || data.data || [],
        ),
      )
      .catch(() => setClasses([]));
  }, []);

  // Fetch subjects when class changes
  useEffect(() => {
    if (!selectedClass) {
      setSubjects([]);
      setSelectedSubject("");
      return;
    }

    fetch(`/api/teacher/subjects?classId=${selectedClass}`)
      .then((res) => res.json())
      .then((data) => setSubjects(Array.isArray(data) ? data : data.data || []))
      .catch(() => setSubjects([]))
      .finally(() => setSelectedSubject(""));
  }, [selectedClass]);

  // Fetch notifications
  useEffect(() => {
    async function loadNotifications() {
      try {
        setLoading(true);
        const res = await fetch("/api/teacher/notifications");
        const data = await res.json();
        // If backend returns { notifications: [...] } adjust accordingly
        setNotifications(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadNotifications();
  }, []);

  // Open notification and mark as read
  const openNotification = async (n: Notification) => {
    try {
      if (!n.read) {
        const res = await fetch(`/api/teacher/notifications/read/${n._id}`, {
          method: "PATCH",
        });
        const { notification } = await res.json();
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === n._id ?
              { ...notif, ...notification, read: true }
            : notif,
          ),
        );
        n = { ...n, ...notification, read: true }; // update local reference for modal
      }
      setSelectedNotification(n);
    } catch (err) {
      console.error(err);
    }
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

  const sendNotification = async () => {
    if (!title || !message || !selectedClass)
      return alert("Fill all required fields");

    try {
      const res = await fetch("/api/teacher/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          message,
          type,
          classId: selectedClass,
          subjectId: selectedSubject || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setNotifications((prev) => [data, ...prev]);
        setTitle("");
        setMessage("");
        setSelectedClass("");
        setSelectedSubject("");
        alert("Notification sent successfully!");
      } else {
        alert(data.error || "Failed to send notification");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send notification");
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
          onClick={() => openNotification(n)}
        >
          <div className="mt-1">{typeIcon(n.type)}</div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800">{n.title}</p>
            {n.className && (
              <p className="text-sm text-gray-400">Class: {n.className}</p>
            )}
            {n.subjectName && (
              <p className="text-sm text-gray-400">Subject: {n.subjectName}</p>
            )}
            {n.userName && (
              <p className="text-sm text-gray-400">By: {n.userName}</p>
            )}
            <p className="text-sm text-gray-700 mt-1">{n.message}</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(n.createdAt).toLocaleString()}
            </p>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );

  if (loading)
    return (
      <p className="p-6 text-gray-500 text-center">Loading notifications...</p>
    );

  return (
    <div className="w-full min-h-screen p-4 bg-gray-50 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        Teacher Notifications
      </h1>

      {/* Send Notification Form */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Send Notification
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="p-2 border border-gray-300 text-gray-600 rounded-lg"
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="p-2 border border-gray-300 text-gray-600 rounded-lg"
          >
            <option value="">Select Subject (Optional)</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={type}
            onChange={(e) => setType(e.target.value as Notification["type"])}
            className="p-2 border border-gray-300 text-gray-600 rounded-lg"
          >
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="FEE">FEE</option>
            <option value="EXAM">EXAM</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border border-gray-300 text-gray-600 rounded-lg"
        />
        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-2 border border-gray-300 text-gray-600 rounded-lg"
        />

        <button
          onClick={sendNotification}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Send /> Send
        </button>
      </div>

      {/* Class Notifications */}
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

      {/* School Notifications */}
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

      {/* Notification Modal */}
      <AnimatePresence>
        {selectedNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 bg-opacity-40 flex items-center justify-center z-50"
            onClick={() => setSelectedNotification(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  {selectedNotification.title}
                </h3>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              {selectedNotification.className && (
                <p className="text-sm font-semibold text-gray-500">
                  Class:{" "}
                  <span className="font-light">
                    {selectedNotification.className}
                  </span>
                </p>
              )}
              {selectedNotification.subjectName && (
                <p className="text-sm font-semibold text-gray-500">
                  Subject:{" "}
                  <span className="font-light">
                    {selectedNotification.subjectName}
                  </span>
                </p>
              )}
              {selectedNotification.userName && (
                <p className="text-sm font-semibold text-gray-500">
                  By:{" "}
                  <span className="font-light">
                    {selectedNotification.userName}
                  </span>
                </p>
              )}
              <p className="text-gray-700 mt-3">
                {selectedNotification.message}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(selectedNotification.createdAt).toLocaleString()}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
