export interface TimetableSlot {
  _id: string;

  classId: {
    _id: string;
    name: string;
  };

  subjectId: {
    _id: string;
    name: string;
  };

  teacherId: {
    _id: string;
    name: string;
  };

  dayOfWeek: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";
  startTime: string;
  endTime: string;
  room?: string;
}
