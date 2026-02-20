// types/auth.ts
export interface AuthToken {
  id: string;
  sub: string; // user ID
  role: "TEACHER" | "ADMIN" | "STUDENT" | "PARENT";
  name?: string;
  email?: string;
  schoolId: string;
  classId?: string;
}
