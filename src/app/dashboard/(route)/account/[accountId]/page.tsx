import React from "react";
import { prisma } from "@/lib/prisma";
import AccountForm from "./AccountForm";
import { checkPermission } from "@/lib/check-permission";

async function AccountPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  const account = await prisma.user.findUnique({
    where: { id: accountId },
  });
  const roles = await prisma.role.findMany();
  if (account === null) {
    await checkPermission(["create:account"]);
  } else {
    await checkPermission(["edit:account"]);
  }
  return (
    <div className="flex-col h-full">
      <div className="space-y-4 px-6 py-8">
        <AccountForm roles={roles} initialData={account} />
      </div>
    </div>
  );
}

export default AccountPage;
