export interface Student {
  _id: string;
  name: string;
  classId: { _id: string; name: string };
  rollNumber?: string;
}

export interface Exam {
  _id: string;
  name: string;
  term: string;
  year: number; // make sure API sends number
}

export interface ExamSubject {
  _id: string;
  name: string;
}

export interface Result {
  _id: string;
  studentId: Student;
  examId: Exam;
  examSubjectId: ExamSubject;
  score: number;
  grade?: string;
  remarks?: string;
  published?: boolean;
  publishedAt?: string;
}
