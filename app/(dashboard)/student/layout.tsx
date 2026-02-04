"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome,
  FiBook,
  FiClipboard,
  FiCalendar,
  FiDollarSign,
  FiBell,
  FiUser,
  FiMenu,
  FiX,
  FiLogOut,
} from "react-icons/fi";
import { signOut } from "next-auth/react";

const navItems = [
  { name: "Dashboard", href: "/student", icon: FiHome },
  { name: "Subjects", href: "/student/subjects", icon: FiBook },
  // { name: "Classes", href: "/student/classes", icon: FiBook },
  { name: "Assignments", href: "/student/assignments", icon: FiClipboard },
  { name: "Timetable", href: "/student/timetable", icon: FiCalendar },
  { name: "Fees", href: "/student/fees", icon: FiDollarSign },
  { name: "Notifications", href: "/student/notifications", icon: FiBell },
  { name: "Profile", href: "/student/profile", icon: FiUser },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* ================= OVERLAY ================= */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/40 z-40"
          />
        )}
      </AnimatePresence>

      {/* ================= SIDEBAR ================= */}
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            className="fixed top-0 left-0 z-50 w-64 h-full bg-white border-r p-5 shadow-xl"
          >
            <div className="mb-8 flex items-center justify-between">
              <h1 className="text-xl font-bold text-indigo-600">
                Student Portal
              </h1>

              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-red-500"
              >
                <FiX size={20} />
              </button>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-2.5 rounded-lg
                      text-sm font-medium transition
                      ${
                        active ?
                          "bg-indigo-100 text-indigo-700"
                        : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                      }
                    `}
                  >
                    <item.icon size={18} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-3 px-4 py-3 mt-10 text-red-600 hover:bg-red-50 transition rounded-lg"
            >
              <FiLogOut size={20} />
              Logout
            </button>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ================= MAIN ================= */}
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b px-4 md:px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => setOpen(true)}
            className="text-gray-600 hover:text-indigo-600"
          >
            <FiMenu size={22} />
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <span className="text-sm text-gray-600">Welcome back 👋</span>
            <img
              src="/avatar.png"
              alt="Avatar"
              className="w-8 h-8 rounded-full border"
            />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 w-full p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
