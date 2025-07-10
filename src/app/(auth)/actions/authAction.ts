"use server";
import { ActionResult } from "@/app";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  LoginSchema,
  loginSchema,
  registerSchema,
  RegisterSchema,
} from "@/lib/schema/authSchema";
import bcrypt from "bcryptjs";
export async function SignInUser(
  data: LoginSchema
): Promise<ActionResult<string>> {
  try {
    const validated = loginSchema.safeParse(data);
    if (validated.success) {
      const { name, password } = validated.data;
      const result = await signIn("credentials", {
        name,
        password,
        redirect: false,
      });
      if (result) {
        return { status: "success", data: "Login Successful" };
      }
    }
    return { status: "error", error: "Login Failed" };
  } catch (error) {
    console.log(error);
    return { status: "error", error: "Invalide Credentials" };
  }
}

export async function LogoutUser() {
  return await signOut({ redirectTo: "/login" });
}

export async function RegisterUser(
  data: RegisterSchema
): Promise<ActionResult<string>> {
  try {
    const validated = registerSchema.safeParse(data);
    if (validated.success) {
      const { name, password, roleId } = validated.data;
      const hashedPassword = await bcrypt.hash(password, 10);
      const existingUser = await prisma.user.findFirst({ where: { name } });
      if (existingUser)
        return { status: "error", error: "User already exists" };
      const result = await prisma.user.create({
        data: { name, password: hashedPassword, roleId },
      });
      if (result) {
        return { status: "success", data: "User register Success!" };
      }
    }
    return { status: "error", error: "Can not registerUser" };
  } catch (error) {
    console.log(error);
    return { status: "error", error: "something went wrong" };
  }
}

export const getUserByName = async (name: string) => {
  const user = await prisma.user.findFirst({
    where: { name },
    include: {
      role: true,
    },
  });
  return user;
};
