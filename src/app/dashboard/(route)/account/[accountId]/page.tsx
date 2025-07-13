import React from "react";
import { prisma } from "@/lib/prisma";
import AccountForm from "./AccountForm";

async function AccountPage({
  params,
}: {
  params: { accountId: string };
}) {
  const account = await prisma.user.findUnique({
    where: { id: params.accountId },
  });
  const roles = await prisma.role.findMany()
  return (
    <div className="flex-col h-full">
      <div className="space-y-4 px-6 py-8">
        <AccountForm roles={roles} initialData={account}/>
      </div>
    </div>
  );
}

export default AccountPage;
