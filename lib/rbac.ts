import { AuthToken } from "@/types/auth";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const SECRET = process.env.NEXTAUTH_SECRET!;

export async function verifyAdmin(
  req: Request | any,
): Promise<NextResponse | AuthToken> {
  const token = (await getToken({ req, secret: SECRET })) as AuthToken | null;

  if (!token || token.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized. Admins only." },
      { status: 403 },
    );
  }

  return token; // ✅ return the admin token
}

export async function verifyTeacher(
  req: Request | any,
): Promise<NextResponse | AuthToken> {
  const token = (await getToken({ req, secret: SECRET })) as AuthToken | null;

  if (!token || token.role !== "TEACHER") {
    return NextResponse.json(
      { error: "Unauthorized. Teachers only." },
      { status: 403 },
    );
  }

  return token; // now TS knows this is AuthToken
}

export async function verifyParent(req: Request | any) {
  const token = await getToken({ req, secret: SECRET });
  if (!token || token.role !== "PARENT") {
    return NextResponse.json(
      { error: "Unauthorized. Parents only." },
      { status: 403 },
    );
  }
  return token; // user is parent
}

export async function verifyStudent(req: Request | any) {
  const token = await getToken({ req, secret: SECRET });
  if (!token || token.role !== "STUDENT") {
    return NextResponse.json(
      { error: "Unauthorized. Students only." },
      { status: 403 },
    );
  }
  return token; // user is student
}

export async function verifyTeacherOrAdmin(
  req: Request | any,
): Promise<NextResponse | AuthToken> {
  const token = (await getToken({
    req,
    secret: SECRET,
  })) as AuthToken | null;

  if (!token || !["ADMIN", "TEACHER"].includes(token.role)) {
    return NextResponse.json(
      { error: "Unauthorized. Admins or Teachers only." },
      { status: 403 },
    );
  }

  return token;
}
