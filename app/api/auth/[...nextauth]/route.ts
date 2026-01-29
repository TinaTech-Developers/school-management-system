import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          console.log("Login failed: Missing email or password");
          return null;
        }

        await connectDB();

        // ✅ Find user case-insensitively
        const user = await User.findOne({
          email: credentials.email.toLowerCase(),
        });
        if (!user) {
          console.log("Login failed: User not found", credentials.email);
          return null;
        }

        // ✅ Check password with bcrypt
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!isValid) {
          console.log("Login failed: Invalid password", credentials.email);
          return null;
        }

        // ✅ Return the user object with role
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role as "ADMIN" | "TEACHER" | "STUDENT" | "PARENT",
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutes
  },

  jwt: {
    maxAge: 30 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      // Store role in JWT on login
      if (user) {
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      // Attach role to session.user
      if (session.user && token.role) {
        session.user.role = token.role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  debug: process.env.NODE_ENV === "development", // helpful for debugging login issues
};

// ✅ Export handler for Next.js Route API
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
