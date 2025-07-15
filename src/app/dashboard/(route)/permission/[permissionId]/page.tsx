import React from "react";
import { prisma } from "@/lib/prisma";
import PermissionForm from "./PermissionForm";
import { checkPermission } from "@/lib/check-permission";

async function permissionPage({
  params,
}: {
  params: { permissionId: string };
}) {
  const permission = await prisma.permission.findUnique({
    where: { id: params.permissionId },
  });
  if (permission === null) {
    await checkPermission(["create:permission"]);
  } else {
    await checkPermission(["edit:permission"]);
  }
  return (
    <div className="flex-col h-full">
      <div className="space-y-4 px-6 py-8">
        <PermissionForm initialData={permission} />
      </div>
    </div>
  );
}

export default permissionPage;
