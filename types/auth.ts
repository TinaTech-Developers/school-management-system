// types/auth.ts
export interface AuthToken {
  sub: string; // user ID
  role: "TEACHER" | "ADMIN" | "STUDENT" | "PARENT";
  name?: string;
  email?: string;
  schoolId: string;
}
