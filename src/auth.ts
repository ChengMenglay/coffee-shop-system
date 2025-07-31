import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import { prisma } from "./lib/prisma";
import authConfig from "@/auth.config";
import type { Adapter } from "next-auth/adapters";
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter | undefined,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = typeof user.role === "object" ? user.role.name : user.role;
        token.permissions = user.permissions ? user.permissions : [];
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
        session.user.permissions = token.permissions;
      }
      return session;
    },
  },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  jwt: { maxAge: 60 * 60 * 24 * 7 },
  ...authConfig,
  providers: [...authConfig.providers],
});

