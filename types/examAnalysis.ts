export interface ExamSummary {
  averageScore: number;
  highest: number;
  lowest: number;
  totalStudents: number;
  passRate: number;
  topStudentName?: string;
  topStudentScore?: number;
}

export interface SubjectAnalysis {
  _id: string;
  avg: number;
  highest: number;
  lowest: number;
  count: number;
}

export interface ExamAnalysisResponse {
  summary: ExamSummary;
  subjectAnalysis: SubjectAnalysis[];
}

export interface SubjectChart {
  // ✅ export it
  name: string;
  average: number;
}

export interface ClassPerf {
  name: string;
  average: number;
}

export interface StudentPerf {
  name: string;
  average: number;
}

export interface ExamAnalysisResponse {
  summary: ExamSummary;
  subjects: SubjectChart[];
  classes: ClassPerf[];
  topStudents: StudentPerf[];
  riskStudents: StudentPerf[];
}

/* ================= TEACHER ANALYSIS ================= */

export interface TeacherExamAnalysisResponse {
  summary: ExamSummary;
  subjects: SubjectChart[];
  topStudents: StudentPerf[];
  riskStudents: StudentPerf[];
}

/* ================= ADMIN ANALYSIS ================= */

export interface AdminExamAnalysisResponse {
  summary: ExamSummary;
  subjects: SubjectChart[];
  classes: ClassPerf[];
  topStudents: StudentPerf[];
  riskStudents: StudentPerf[];
}
