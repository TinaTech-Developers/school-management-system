import TimetableCell from "./TimetableCell";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI"];
const TIMES = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
];

export default function TimetableGrid({ slots, onSelect }: any) {
  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto">
      <div className="grid grid-cols-[100px_repeat(5,1fr)] border-b">
        <div />
        {DAYS.map((d) => (
          <div key={d} className="p-3 text-center font-semibold text-gray-600">
            {d}
          </div>
        ))}
      </div>

      {TIMES.map((time) => (
        <div
          key={time}
          className="grid grid-cols-[100px_repeat(5,1fr)] border-b"
        >
          <div className="p-3 text-sm text-gray-500">{time}</div>

          {DAYS.map((day) => {
            const slot = slots.find(
              (s: any) => s.dayOfWeek === day && s.startTime === time,
            );

            return (
              <TimetableCell
                key={day + time}
                slot={slot}
                onClick={() => slot && onSelect(slot)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
