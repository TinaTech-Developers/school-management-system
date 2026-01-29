export interface Result {
  _id: string;

  studentId: {
    _id: string;
    name: string;
  };

  examId: {
    _id: string;
    name: string;
    term: string;
    year: number;
  };

  examSubjectId: {
    _id: string;
    name: string;
  };

  score: number;
  grade?: string;

  published?: boolean;
  publishedAt?: string;
}
