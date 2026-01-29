"use client";

interface Props {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: Props) {
  return (
    <div
      className={`fixed bottom-6 right-6 px-4 py-2 rounded shadow text-white ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <span>{message}</span>
        <button onClick={onClose} className="font-bold">
          X
        </button>
      </div>
    </div>
  );
}
