export default function TimetableCell({ slot, onClick }: any) {
  if (!slot) {
    return <div className="border-l h-20" />;
  }

  return (
    <div
      onClick={onClick}
      className="border-l h-20 p-2 cursor-pointer bg-teal-50 hover:bg-teal-100 transition"
    >
      <p className="text-xs font-semibold text-teal-700">
        {slot.subjectId.name}
      </p>
      <p className="text-xs text-gray-600">{slot.teacherId.name}</p>
      <p className="text-xs text-gray-400">{slot.room || "No room"}</p>
    </div>
  );
}
