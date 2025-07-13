import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string;
    } & DefaultSession["user"]; // ✅ extend, don't replace
  }
  interface User extends DefaultUser {
    id: string;
    role: string | { name: string }; // Handle both cases
    permissions: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
    role?: string;
    permissions: string[];
  }
}
