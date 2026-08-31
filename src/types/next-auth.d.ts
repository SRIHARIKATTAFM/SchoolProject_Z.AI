import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      role?: string;
      schoolId?: string;
      staffId?: string;
      studentId?: string;
    };
  }
  interface User {
    role?: string;
    schoolId?: string;
    staffId?: string;
    studentId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    schoolId?: string;
    staffId?: string;
    studentId?: string;
  }
}
