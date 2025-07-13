import React from "react";
import { prisma } from "@/lib/prisma";
import RoleForm from "./RoleForm";

async function permissionPage({
  params,
}: {
  params: { roleId: string };
}) {
  const role = await prisma.role.findUnique({
    where: { id: params.roleId },
    include: { permissions: true },
  });
  const permissions= await prisma.permission.findMany();
  return (
    <div className="flex-col h-full">
      <div className="space-y-4 px-6 py-8">
        <RoleForm permissions={permissions} initialData={role}/>
      </div>
    </div>
  );
}

export default permissionPage;
