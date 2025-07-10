import z from "zod";

export const loginSchema = z.object({
  name: z.string().min(1, "Name is required"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters"),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters"),
  roleId: z.string(),
});

export type RegisterSchema = z.infer<typeof registerSchema>