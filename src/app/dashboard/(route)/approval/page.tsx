import { checkPermission } from "@/lib/check-permission";
import { prisma } from "@/lib/prisma";
import React from "react";
import ApprovalClient from "./components/client";
import { PurchaseColumn, StockUsageColumn } from "./components/columns";
import { format, formatDistanceToNowStrict } from "date-fns";

export default async function Approval() {
  await checkPermission(["view:approval"]);
  const [pendingPurchases, pendingStocks] = await Promise.all([
    prisma.pendingPurchase.findMany({
      where: { approvalStatus: { in: ["Approved", "Rejected"] } },
      include: {
        ingredient: { select: { name: true, unit: true } },
        user: { select: { name: true } },
        approvedBy: {},
        supplier: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.pendingStockUsage.findMany({
      where: { approvalStatus: { in: ["Approved", "Rejected"] } },
      include: {
        ingredient: { select: { name: true, unit: true } },
        user: { select: { name: true } },
        approvedBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const formattedPurchases: PurchaseColumn[] = pendingPurchases.map((item) => ({
    id: item.id,
    ingredient: item.ingredient.name,
    requestedBy: item.user.name,
    approvalStatus: item.approvalStatus,
    approvedBy: item.approvedBy?.name || "N/A",
    approvedAt:
      formatDistanceToNowStrict(new Date(item.approvedAt as Date), {
        addSuffix: true,
      }) || "N/A",
    rejectionReason: item.rejectionReason || "N/A",
    note: item.note || "",
    createdAt: format(item.createdAt, "dd MMMM yyyy"),
  }));
  const formattedStocks: StockUsageColumn[] = pendingStocks.map((item) => ({
    id: item.id,
    ingredient: item.ingredient.name,
    requestedBy: item.user.name,
    status: item.status,
    approvalStatus: item.approvalStatus,
    note: item.note || "",
    approvedBy: item.approvedBy?.name || "N/A",
    approvedAt:
      formatDistanceToNowStrict(new Date(item.approvedAt as Date), {
        addSuffix: true,
      }) || "N/A",
    rejectionReason: item.rejectionReason || "N/A",
    createdAt: format(item.createdAt, "dd MMMM yyyy"),
  }));
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 px-6 py-8">
        <ApprovalClient
          purchaseData={formattedPurchases}
          stockUsageData={formattedStocks}
        />
      </div>
    </div>
  );
}
