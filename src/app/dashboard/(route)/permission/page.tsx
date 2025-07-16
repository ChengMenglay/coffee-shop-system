import React from "react";
import IngredientClient from "./components/client";
import { prisma } from "@/lib/prisma";
import { PermissionColumn } from "./components/columns";
import { checkPermission } from "@/lib/check-permission";

export const dynamic = "force-dynamic";
async function PermissionPage() {
  await checkPermission(["view:permission"]);
  const permissions = await prisma.permission.findMany({orderBy: { name: "asc" }});
  const formattedPermission: PermissionColumn[] = permissions.map((item) => ({
    id: item.id,
    name: item.name,
    key: item.key,
  }));
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 px-6 py-8">
        <IngredientClient data={formattedPermission} />
      </div>
    </div>
  );
}

export default PermissionPage;
