"use client";
import { useSession } from "next-auth/react";

export function usePermissio(permissionKey: string) {
  const { data: session } = useSession();
  return session?.user.permissions.includes(permissionKey) ?? false;
}
