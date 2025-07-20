import { useSession } from "next-auth/react";

export const usePermissions = () => {
  const { data: session, status } = useSession();
  const canPerformAction = (requiredPermission: string[]) => {
    const permissions = session?.user?.permissions || [];
    const hasPermission = requiredPermission.some((p) =>
      permissions.includes(p)
    );
    return hasPermission;
  };

  return { canPerformAction };
};
