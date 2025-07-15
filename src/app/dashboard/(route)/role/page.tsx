import React from "react";
import { prisma } from "@/lib/prisma";
import { RoleColumn } from "./components/columns";
import RoleClient from "./components/client";
import { checkPermission } from "@/lib/check-permission";

async function RolePage() {
  await checkPermission(["view:role"]);
  const roles = await prisma.role.findMany({ include: { permissions: true } });
  const formattedRoles: RoleColumn[] = roles.map((item) => ({
    id: item.id,
    name: item.name,
    permissions: item.permissions.map((permission) => permission.name),
  }));
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 px-6 py-8">
        <RoleClient data={formattedRoles} />
      </div>
    </div>
  );
}

export default RolePage;
