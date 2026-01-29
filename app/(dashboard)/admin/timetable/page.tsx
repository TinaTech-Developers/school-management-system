"use client";

import { useEffect, useState } from "react";
import TimetableGrid from "./_components/TimetableGrid";
import TimetableModal from "./_components/TimetableModal";

export default function TimetablePage() {
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const loadTimetable = async () => {
    const res = await fetch("/api/timetable");
    const data = await res.json();
    setSlots(data);
  };

  useEffect(() => {
    loadTimetable();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            School Timetable
          </h1>
          <p className="text-sm text-gray-500">
            Manage classes, teachers & subjects without conflicts
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedSlot(null);
            setOpen(true);
          }}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
        >
          + Add Slot
        </button>
      </div>

      {/* Grid */}
      <TimetableGrid
        slots={slots}
        onSelect={(slot: any) => {
          setSelectedSlot(slot);
          setOpen(true);
        }}
      />

      {/* Modal */}
      {open && (
        <TimetableModal
          slot={selectedSlot}
          onClose={() => setOpen(false)}
          onSaved={loadTimetable}
        />
      )}
    </div>
  );
}
