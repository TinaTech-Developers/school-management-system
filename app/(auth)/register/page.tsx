"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

export default function SchoolRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Registration failed", { autoClose: 3000 });
        setLoading(false);
        return;
      }

      toast.success("Account created successfully!", { autoClose: 2000 });
      //   setTimeout(() => router.push("/login"), 500);
    } catch (err) {
      toast.error("Something went wrong. Please try again.", {
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#0B0B0B] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-[#121212] rounded-3xl p-8 shadow-lg border border-white/10"
      >
        {/* School Logo */}
        <div className="flex justify-center mb-4">
          <img
            src="/school-logo.png"
            alt="School Logo"
            className="h-12 w-auto"
          />
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-2">
          School Portal Register
        </h1>
        <p className="text-center text-gray-400 mb-4 text-sm">
          Create your account to access your school portal
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-xl bg-[#1a1a1a] border border-white/20 px-4 py-2.5 text-white text-sm placeholder-gray-500 outline-none focus:ring-2 focus:ring-white/30 transition"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl bg-[#1a1a1a] border border-white/20 px-4 py-2.5 text-white text-sm placeholder-gray-500 outline-none focus:ring-2 focus:ring-white/30 transition"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl bg-[#1a1a1a] border border-white/20 px-4 py-2.5 text-white text-sm placeholder-gray-500 outline-none focus:ring-2 focus:ring-white/30 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-sm"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-xl bg-[#1a1a1a] border border-white/20 px-4 py-2.5 text-white text-sm outline-none focus:ring-2 focus:ring-white/30 transition"
          >
            <option value="ADMIN">Admin</option>
            <option value="TEACHER">Teacher</option>
            <option value="STUDENT">Student</option>
            <option value="PARENT">Parent</option>
          </select>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition ${
              loading
                ? "bg-gray-500 text-gray-200 cursor-not-allowed"
                : "bg-white text-black hover:bg-[#A89078]"
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </motion.button>
        </form>

        <p className="text-center text-gray-500 mt-4 text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-white underline hover:text-gray-300">
            Login
          </a>
        </p>

        <p className="text-center text-gray-600 mt-6 text-xs">
          © 2026 Your School Portal. All rights reserved.
        </p>

        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      </motion.div>
    </div>
  );
}
