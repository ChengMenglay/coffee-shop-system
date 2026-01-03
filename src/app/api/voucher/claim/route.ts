import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const userId = searchParams.get("userId");

    if (!code || !userId) {
      return NextResponse.json(
        { error: "Missing code or userId" },
        { status: 400 }
      );
    }

    const voucher = await prisma.voucher.findUnique({
      where: { code },
    });

    if (!voucher || !voucher.isActive) {
      return NextResponse.json(
        { error: "Voucher not available" },
        { status: 400 }
      );
    }

    const now = new Date();
    if (now < voucher.startDate || now > voucher.endDate) {
      return NextResponse.json({ error: "Voucher expired" }, { status: 400 });
    }

    // Atomic transaction - all checks inside to prevent race conditions
    await prisma.$transaction(async (tx) => {
      // Check total usage limit
      const freshVoucher = await tx.voucher.findUnique({
        where: { id: voucher.id },
        select: {
          usedCount: true,
          usageLimit: true,
          perUserLimit: true,
        },
      });

      if (!freshVoucher) {
        throw new Error("Voucher not found");
      }

      if (
        freshVoucher.usageLimit !== null &&
        freshVoucher.usedCount >= freshVoucher.usageLimit
      ) {
        throw new Error("Voucher fully claimed");
      }

      // Check per-user limit inside transaction
      if (freshVoucher.perUserLimit !== null) {
        const userClaimCount = await tx.voucherUsage.count({
          where: {
            voucherId: voucher.id,
            userId,
          },
        });

        if (userClaimCount >= freshVoucher.perUserLimit) {
          throw new Error("Voucher per-user limit reached");
        }
      }

      // Create voucher usage (will fail if duplicate due to unique constraint)
      await tx.voucherUsage.create({
        data: {
          voucherId: voucher.id,
          userId,
        },
      });

      // Increment usage count
      await tx.voucher.update({
        where: { id: voucher.id },
        data: {
          usedCount: { increment: 1 },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Voucher claimed successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to claim voucher" },
      { status: 400 }
    );
  }
}
