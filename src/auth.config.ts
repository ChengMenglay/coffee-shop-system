import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "./lib/schema/authSchema";
import bcrypt from "bcryptjs";
import { NextAuthConfig } from "next-auth";
import { getUserByName } from "./app/(auth)/actions/authAction";

export default {
  providers: [
    Credentials({
      name: "credentials",
      async authorize(credentials) {
        const validated = loginSchema.safeParse(credentials);
        if (validated.success) {
          const { name, password } = validated.data;
          const user = await getUserByName(name);
          if (user && (await bcrypt.compare(password, user.password))) {
            return {
              id: user.id,
              name: user.name,
              role: user.role.name,
            };
          }
          return null;
        }
        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
