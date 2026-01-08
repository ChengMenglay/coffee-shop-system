import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET all vouchers
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const vouchers = await prisma.voucher.findMany({
      orderBy: { createdAt: "desc" },
      where: {
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
      include: {
        voucherUsages: userId
          ? {
              where: { userId },
            }
          : false,
      },
    });

    // Filter vouchers that haven't reached their usage limit
    const availableVouchers = vouchers.filter((voucher) => {
      // Check global usage limit
      if (
        voucher.usageLimit !== null &&
        voucher.usedCount >= voucher.usageLimit
      ) {
        return false;
      }

      // Check per-user usage limit if userId is provided
      if (userId && voucher.perUserLimit !== null) {
        const userUsageCount = voucher.voucherUsages?.length || 0;
        if (userUsageCount >= voucher.perUserLimit) {
          return false;
        }
      }

      return true;
    });

    return NextResponse.json(availableVouchers);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch vouchers" },
      { status: 500 }
    );
  }
}

// POST create a new voucher
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderTotal,
      maxDiscount,
      startDate,
      endDate,
      usageLimit,
      perUserLimit,
      isActive,
    } = body;

    // Basic validation
    if (!code || !discountType || !discountValue || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newVoucher = await prisma.voucher.create({
      data: {
        code,
        description,
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderTotal: minOrderTotal ? parseFloat(minOrderTotal) : undefined,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        usageLimit: usageLimit ?? undefined,
        perUserLimit: perUserLimit ?? undefined,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(newVoucher);
  } catch (error: any) {
    if (error.code === "P2002") {
      // Prisma unique constraint failed
      return NextResponse.json(
        { error: "Voucher code already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create voucher" },
      { status: 500 }
    );
  }
}
