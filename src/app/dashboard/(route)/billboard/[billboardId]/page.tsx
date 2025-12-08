import React from "react";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/check-permission";
import BillboardForm from "./BillboardForm";

async function BillboardPage({
  params,
}: {
  params: Promise<{ billboardId: string }>;
}) {
  const { billboardId } = await params;
  const billboard = await prisma.billboard.findUnique({
    where: { id: billboardId },
  });
  if (billboard === null) {
    await checkPermission(["create:billboard"]);
  } else {
    await checkPermission(["edit:billboard"]);
  }
  return (
    <div className="flex-col h-full">
      <div className="space-y-4 px-6 py-8">
        <BillboardForm initialData={billboard} />
      </div>
    </div>
  );
}

export default BillboardPage;
