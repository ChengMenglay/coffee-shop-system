import React from "react";
import PromotionClient from "./components/client";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { checkPermission } from "@/lib/check-permission";
import { PromotionType } from "@prisma/client";
import { VoucherColumn } from "./components/columns";
import VoucherClient from "./components/client";
import { formatterUSD } from "@/lib/utils";
async function VoucherPage() {
  await checkPermission(["view:voucher"]);
  const vouchers = await prisma.voucher.findMany({
    orderBy: { createdAt: "desc" },
  });
  const formattedVouchers: VoucherColumn[] = vouchers.map((item) => ({
    id: item.id,
    code: item.code,
    discountType: item.discountType,
    discountValue: formatterUSD.format(Number(item.discountValue)),
    perUserLimit: item.perUserLimit ?? 0,
    usageLimit: item.usageLimit ?? 0,
    startDate: item?.startDate,
    endDate: item?.endDate,
    isActive: item.isActive,
    createdAt: format(item.createdAt, "dd MMMM yyyy"),
  }));
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 px-6 py-8">
        <VoucherClient data={formattedVouchers} />
      </div>
    </div>
  );
}

export default VoucherPage;
