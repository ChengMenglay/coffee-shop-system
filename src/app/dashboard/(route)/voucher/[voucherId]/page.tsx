import React from "react";
import PromotionForm from "./VoucherForm";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/check-permission";
import VoucherForm from "./VoucherForm";

async function VoucherPage({
  params,
}: {
  params: Promise<{ voucherId: string }>;
}) {
  const { voucherId } = await params;
  const voucher = await prisma.voucher.findUnique({
    where: { id: voucherId },
  });
  if (voucher === null) {
    await checkPermission(["create:voucher"]);
  } else {
    await checkPermission(["edit:voucher"]);
  }

  const formattedVoucher = voucher
    ? {
        ...voucher,
        discountValue: voucher.discountValue?.toNumber() || 0,
        minOrderTotal: voucher.minOrderTotal?.toNumber() || null,
        maxDiscount: voucher.maxDiscount?.toNumber() || null,
      }
    : null;
  return (
    <div className="flex-col h-full">
      <div className="space-y-4 px-6 py-8">
        <VoucherForm initialData={formattedVoucher} />
      </div>
    </div>
  );
}

export default VoucherPage;
