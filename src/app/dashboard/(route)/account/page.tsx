import React from "react";
import { prisma } from "@/lib/prisma";
import { AccountColumn } from "./components/columns";
import AccountClient from "./components/client";
import { format } from "date-fns";

async function AccountPage() {
  const accounts = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      phone: true,
      createdAt: true,
      role: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedAccount: AccountColumn[] = accounts.map((item) => ({
    id: item.id,
    name: item.name,
    phone: item.phone || "",
    role: item.role.name,
    createdAt: format(item.createdAt, "dd MMMM yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 px-6 py-8">
        <AccountClient data={formattedAccount} />
      </div>
    </div>
  );
}

export default AccountPage;
