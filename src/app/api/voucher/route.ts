import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET all vouchers
export async function GET(_req: Request) {
  try {
    const vouchers = await prisma.voucher.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(vouchers);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch vouchers" }, { status: 500 });
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
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
      return NextResponse.json({ error: "Voucher code already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create voucher" }, { status: 500 });
  }
}
