import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const voucherUsages = await prisma.voucherUsage.findMany({
    where: {
      userId,
      voucher: {
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    },
    include: {
      voucher: true,
    },
    orderBy: { usedAt: "desc" },
  });

  // Filter out vouchers that have reached their usage limits
  const availableVoucherUsages = voucherUsages.filter((usage) => {
    const voucher = usage.voucher;

    // Check global usage limit
    if (
      voucher.usageLimit !== null &&
      voucher.usedCount >= voucher.usageLimit
    ) {
      return false;
    }

    // Check per-user usage limit
    if (voucher.perUserLimit !== null) {
      const userUsageCount = voucherUsages.filter(
        (u) => u.voucherId === voucher.id
      ).length;
      if (userUsageCount >= voucher.perUserLimit) {
        return false;
      }
    }

    return true;
  });

  return NextResponse.json(availableVoucherUsages);
}
