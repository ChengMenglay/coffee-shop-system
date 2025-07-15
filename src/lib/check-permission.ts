import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function checkPermission(requiredPermission: string[]) {
  const session = await auth();
  const permissions = session?.user?.permissions || [];
  const hasPermission = requiredPermission.some((permission) =>
    permissions.includes(permission)
  );
  if (!hasPermission) redirect("/unauthorized");
}
