import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { AuthToken } from "@/types/auth";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function getAuthUser(): Promise<AuthToken | null> {
  try {
    const cookieStore = await cookies(); // ✅ await is REQUIRED
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as AuthToken;

    return decoded;
  } catch (error) {
    return null;
  }
}
