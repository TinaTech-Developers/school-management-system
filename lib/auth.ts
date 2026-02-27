import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { AuthToken } from "@/types/auth";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function getAuthUser(): Promise<AuthToken | null> {
  try {
    const cookieStore = await cookies(); // your version supports await
    const tokenCookie = cookieStore.get("token");

    if (!tokenCookie) {
      console.log("NO TOKEN COOKIE FOUND");
      return null;
    }

    const decoded = jwt.verify(tokenCookie.value, JWT_SECRET) as AuthToken;

    return decoded;
  } catch (error) {
    console.error("JWT ERROR:", error);
    return null;
  }
}
