import React from "react";
import { prisma } from "@/lib/prisma";
import { StockUsageColumn } from "./components/type";
import { formatDistanceToNowStrict } from "date-fns";
import { checkPermission } from "@/lib/check-permission";
import StockUsageClient from "./components/client";
import { getUserId } from "@/app/(auth)/actions/authAction";

async function PurchaseRequestPage() {
  await checkPermission(["view:stock-usage-request"]);
  const [pendingStocks, userId] = await Promise.all([
    prisma.pendingStockUsage.findMany({
      where: { approvalStatus: "Pending" },
      include: {
        user: { select: { name: true, role: true } },
        ingredient: { select: { name: true, unit: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    getUserId(),
  ]);

  const formattedStocks: StockUsageColumn[] = pendingStocks.map((item) => ({
    id: item.id,
    ingredient: item.ingredient.name,
    quantity: ` ${item.quantity} ${item.ingredient.unit}`,
    requestedBy: item.user.name + " (" + item.user.role.name + ")",
    status: item.status,
    approvalStatus: item.approvalStatus,
    note: item.note || "",
    createdAt: formatDistanceToNowStrict(new Date(item.createdAt), {
      addSuffix: true,
    }),
  }));
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 px-6 py-8">
        <StockUsageClient userId={userId as string} data={formattedStocks} />
      </div>
    </div>
  );
}

export default PurchaseRequestPage;
