import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// Role + school-scoped session via JWT. Roles map 1:1 to portals.
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "School Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: { staff: true, student: true },
        });
        if (!user || !user.active) return null;
        const ok = bcrypt.compareSync(credentials.password, user.password);
        if (!ok) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          schoolId: user.schoolId ?? undefined,
          staffId: user.staffId ?? undefined,
          studentId: user.studentId ?? undefined,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.schoolId = (user as any).schoolId;
        token.staffId = (user as any).staffId;
        token.studentId = (user as any).studentId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).schoolId = token.schoolId;
        (session.user as any).staffId = token.staffId;
        (session.user as any).studentId = token.studentId;
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "zphs-kunaparajuparva-dev-secret-change-in-prod",
};

export type Role =
  | "HM"
  | "TEACHER"
  | "STUDENT"
  | "PARENT"
  | "SCHEME_OPERATOR"
  | "ID_OPERATOR"
  | "MEO"
  | "DEO"
  | "STATE"
  | "MINISTER";
