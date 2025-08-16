import React from "react";
import PromotionClient from "./components/client";
import { prisma } from "@/lib/prisma";
import { PromotionColumn } from "./components/columns";
import { format } from "date-fns";
import { checkPermission } from "@/lib/check-permission";
import { PromotionType } from "@prisma/client";
async function PromotionPage() {
  await checkPermission(["view:promotion"]);
  const promotions = await prisma.promotion.findMany({
    orderBy: { createdAt: "desc" },
  });
  const formattedPromotions: PromotionColumn[] = promotions.map((item) => ({
    id: item.id,
    name: item.name,
    type: item.type,
    buyQuantity: item?.buyQuantity || 0,
    freeQuantity: item?.freeQuantity || 0,
    discount: Number(item?.discount) || 0,
    startDate: item?.startDate,
    endDate: item?.endDate,
    showDiscount:
      item.type === PromotionType.BUY_X_GET_Y
        ? `Buy ${item?.buyQuantity} Get ${item?.freeQuantity}`
        : item.type === PromotionType.PERCENT_DISCOUNT && item?.discount
        ? `Discount ${item?.discount.toNumber()}%`
        : item.type === PromotionType.FIXED_DISCOUNT && item?.discount
        ? `Fixed Discount ${item?.discount.toNumber()}$`
        : "No Discount",
    isActive: item.isActive,
    createdAt: format(item.createdAt, "dd MMMM yyyy"),
  }));
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 px-6 py-8">
        <PromotionClient data={formattedPromotions} />
      </div>
    </div>
  );
}

export default PromotionPage;
