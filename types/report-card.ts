export interface ReportResult {
  subject: string;
  score: number;
  grade: string;
  remarks?: string;
  gpa: number;
}

export interface ReportStudent {
  id: string;
  name: string;
  className: string;
  rollNumber?: string;
}

export interface ReportExam {
  id: string;
  name: string;
  term: string;
  year: number;
}

export interface ReportCardData {
  student: ReportStudent;
  exam: ReportExam;
  results: ReportResult[];
  gpa: number;
}
