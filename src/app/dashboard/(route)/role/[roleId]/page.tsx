import React from "react";
import { prisma } from "@/lib/prisma";
import RoleForm from "./RoleForm";
import { checkPermission } from "@/lib/check-permission";

async function permissionPage({
  params,
}: {
  params: Promise<{ roleId: string }>;
}) {
  const { roleId } = await params;
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: { permissions: true },
  });
  const permissions = await prisma.permission.findMany();
  if (role === null) {
    await checkPermission(["create:role"]);
  } else {
    await checkPermission(["edit:role"]);
  }
  return (
    <div className="flex-col h-full">
      <div className="space-y-4 px-6 py-8">
        <RoleForm permissions={permissions} initialData={role}/>
      </div>
    </div>
  );
}

export default permissionPage;
