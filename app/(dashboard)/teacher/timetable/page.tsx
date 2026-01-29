"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";

type Day =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

interface TeacherSlot {
  id: string;
  day: Day;
  startTime: string;
  endTime: string;
  subject: string;
  className: string;
  room?: string;
  type?: "CLASS" | "EXAM";
  locked?: boolean;
}

const DAYS: Day[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function getTodayDay(): Day {
  return new Date().toLocaleDateString("en-US", { weekday: "long" }) as Day;
}

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export default function TeacherTimetablePage() {
  const [slots, setSlots] = useState<TeacherSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TeacherSlot | null>(null);

  const today = getTodayDay();
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  // ================= FETCH TIMETABLE =================
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/teacher/timetable");
        const data = await res.json();
        setSlots(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ================= LESSON REMINDERS =================
  useEffect(() => {
    if (!slots.length) return;
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();

    slots
      .filter((s) => s.day === today)
      .forEach((slot) => {
        const reminderTime = toMinutes(slot.startTime) - 10;
        if (nowMin === reminderTime) {
          new Notification("Upcoming Lesson", {
            body: `${slot.subject} (${slot.className}) starts in 10 minutes`,
          });
        }
      });
  }, [slots, today]);

  // ================= BUILD DAILY SCHEDULE WITH FREE PERIODS =================
  const buildDaySchedule = (day: Day) => {
    const daySlots = slots
      .filter((s) => s.day === day)
      .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

    const result: (TeacherSlot | { free: true; from: string; to: string })[] =
      [];

    daySlots.forEach((slot, i) => {
      result.push(slot);
      const next = daySlots[i + 1];
      if (next && toMinutes(next.startTime) > toMinutes(slot.endTime)) {
        result.push({
          free: true,
          from: slot.endTime,
          to: next.startTime,
        });
      }
    });

    return result;
  };

  // ================= LIVE LESSON =================
  const todaySlots = useMemo(
    () => slots.filter((s) => s.day === today),
    [slots, today],
  );

  const currentLesson = todaySlots.find(
    (s) =>
      nowMinutes >= toMinutes(s.startTime) &&
      nowMinutes <= toMinutes(s.endTime),
  );

  if (loading) {
    return <p className="p-6 text-gray-500">Loading timetable…</p>;
  }

  return (
    <div className="space-y-8">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Teaching Timetable
          </h1>
          <p className="text-gray-600 mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>

        <div className="bg-white border rounded-xl px-4 py-3 shadow-sm">
          {currentLesson ?
            <div>
              <p className="text-xs text-green-500 ">LIVE NOW</p>
              <p className="font-semibold text-gray-900">
                {currentLesson.subject}
              </p>
              <p className="text-sm text-gray-500">
                {currentLesson.className} • {currentLesson.room ?? "—"}
              </p>
            </div>
          : <p className="text-sm text-gray-500">No active lesson</p>}
        </div>
      </div>

      {/* ================= TIMETABLE GRID ================= */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {DAYS.map((day) => (
          <div
            key={day}
            className={clsx(
              "bg-white rounded-xl border p-4 transition",
              day === today ? "ring-2 ring-blue-500" : "opacity-80",
            )}
          >
            <h2 className="text-lg font-semibold text-center text-gray-900 border-b pb-2">
              {day}
            </h2>

            <div className="mt-4 space-y-3">
              {buildDaySchedule(day).map((item, i) =>
                "free" in item ?
                  <div
                    key={i}
                    className="text-center text-xs text-gray-600 italic border border-dashed rounded p-2"
                  >
                    FREE PERIOD ({item.from} – {item.to})
                  </div>
                : <div
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className={clsx(
                      "border rounded-lg p-3 cursor-pointer hover:shadow relative",
                      item.locked && "opacity-60",
                    )}
                  >
                    {day === today &&
                      nowMinutes >= toMinutes(item.startTime) &&
                      nowMinutes <= toMinutes(item.endTime) && (
                        <span className="absolute top-2 right-2 text-xs font-semibold text-green-600">
                          LIVE
                        </span>
                      )}

                    <div className="flex justify-between">
                      <p className="font-semibold text-gray-600">
                        {item.subject}
                      </p>
                      {item.locked && <span>🔒</span>}
                    </div>

                    <p className="text-sm text-gray-500">{item.className}</p>

                    <div className="text-xs text-gray-400 flex justify-between mt-1">
                      <span>
                        {item.startTime} – {item.endTime}
                      </span>
                      {item.room && <span>{item.room}</span>}
                    </div>

                    {item.type && (
                      <span
                        className={clsx(
                          "inline-block mt-2 text-xs px-2 py-0.5 rounded",
                          item.type === "EXAM" ?
                            "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600",
                        )}
                      >
                        {item.type}
                      </span>
                    )}
                  </div>,
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ================= LESSON DETAILS MODAL ================= */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-xl font-bold">{selected.subject}</h3>
            <p className="text-gray-600">{selected.className}</p>
            <p className="text-sm">
              {selected.startTime} – {selected.endTime}
            </p>
            {selected.room && <p>Room: {selected.room}</p>}
            {selected.locked && (
              <p className="text-sm text-red-600">
                🔒 Locked by administration
              </p>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 text-sm border rounded"
              >
                Close
              </button>

              {!selected.locked && (
                <button
                  onClick={() =>
                    (window.location.href = `/teacher/register/${selected.id}`)
                  }
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded"
                >
                  Mark Register
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
