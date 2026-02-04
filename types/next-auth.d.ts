import { DefaultSession, DefaultJWT } from "next-auth";
import { UserRole } from "@/types/role";
import NextAuth from "next-auth";
import { Types } from "mongoose";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
      classId?: string;
      schoolId: string;
      name: string;
      email: string;
    };
  }

  interface User {
    id: string;
    role: UserRole;
    schoolId?: string;
    classId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: UserRole;
    schoolId?: string;
    classId?: string;
  }
}
