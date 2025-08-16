import React from "react";
import PromotionForm from "./PromotionForm";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/check-permission";

async function PromotionPage({
  params,
}: {
  params: Promise<{ promotionId: string }>;
}) {
  const { promotionId } = await params;
  const promotion = await prisma.promotion.findUnique({
    where: { id: promotionId },
  });
  if (promotion === null) {
    await checkPermission(["create:promotion"]);
  } else {
    await checkPermission(["edit:promotion"]);
  }

  const formattedPromotionType = promotion ? {...promotion, discount:promotion.discount?.toNumber() || 0} : null;
  return (
    <div className="flex-col h-full">
      <div className="space-y-4 px-6 py-8">
        <PromotionForm initialData={formattedPromotionType} />
      </div>
    </div>
  );
}

export default PromotionPage;
