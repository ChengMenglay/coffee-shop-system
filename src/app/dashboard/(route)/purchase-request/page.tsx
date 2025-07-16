import React from "react";
import { prisma } from "@/lib/prisma";
import { PurchaseColumn } from "./components/type";
import { format, formatDistanceToNowStrict } from "date-fns";
import { checkPermission } from "@/lib/check-permission";
import { formatterUSD } from "@/lib/utils";
import PurchaseClient from "./components/client";
import { getUserId } from "@/app/(auth)/actions/authAction";

async function PurchaseRequestPage() {
  await checkPermission(["view:purchase-request"]);
  const [pendingPurchases, userID] = await Promise.all([
    prisma.pendingPurchase.findMany({
      where: { approvalStatus: "Pending" },
      include: {
        user: { select: { name: true, role: true } },
        ingredient: { select: { name: true, unit: true } },
        supplier: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    getUserId(),
  ]);

  const formattedPurchases: PurchaseColumn[] = pendingPurchases.map((item) => ({
    id: item.id,
    ingredient: item.ingredient.name,
    quantity: ` ${item.quantity} ${item.ingredient.unit}`,
    supplier: item.supplier.name || "",
    requestedBy: item.user.name + " (" + item.user.role.name + ")",
    approvalStatus: item.approvalStatus,
    note: item.note || "",
    price: formatterUSD.format(Number(item.price)),
    createdAt: formatDistanceToNowStrict(new Date(item.createdAt), {
      addSuffix: true,
    }),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 px-6 py-8">
        <PurchaseClient userId={userID as string} data={formattedPurchases} />
      </div>
    </div>
  );
}

export default PurchaseRequestPage;
