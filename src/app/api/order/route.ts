import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      orderStatus,
      paymentMethod,
      paymentStatus,
      total,
      oderFrom,
      discount,
      pickupTime,
      voucherCode,
    } = body;

    // ✅ Validation
    if (!userId)
      return NextResponse.json("User Id is required!", { status: 400 });
    if (!orderStatus)
      return NextResponse.json("Order status is required!", { status: 400 });
    if (!paymentMethod)
      return NextResponse.json("Payment method is required!", { status: 400 });
    if (paymentStatus === undefined)
      return NextResponse.json("Payment status is required!", { status: 400 });
    if (!total || total <= 0)
      return NextResponse.json("Total price is required!", { status: 400 });

    // 🔄 Find last order and calculate next displayId (1-100 loop)
    const lastOrder = await prisma.order.findFirst({
      orderBy: { createdAt: "desc" },
      select: { displayId: true },
    });

    const nextDisplayId = ((lastOrder?.displayId ?? 0) % 100) + 1;

    let discountVoucher = 0;
    let voucherId: string | null = null;

    //Voucher validation
    if (voucherCode) {
      const voucher = await prisma.voucher.findUnique({
        where: { code: voucherCode },
        include: { voucherUsages: { where: { userId } } },
      });

      if (!voucher || !voucher.isActive) {
        return NextResponse.json("Invalid voucher", { status: 400 });
      }

      // Check if user has claimed this voucher
      if (voucher.voucherUsages.length === 0) {
        return NextResponse.json("You must claim this voucher first", {
          status: 400,
        });
      }

      const now = new Date();
      if (now < voucher.startDate || now > voucher.endDate) {
        return NextResponse.json("Voucher expired", { status: 400 });
      }
      if (voucher.minOrderTotal && total < voucher.minOrderTotal) {
        return NextResponse.json(`Minimum order is ${voucher.minOrderTotal}`, {
          status: 400,
        });
      }
      if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
        return NextResponse.json("Voucher usage limit reached", {
          status: 400,
        });
      }

      if (
        voucher.perUserLimit &&
        voucher.voucherUsages.length >= voucher.perUserLimit
      ) {
        return NextResponse.json("You already used this voucher", {
          status: 400,
        });
      }

      //Calculate discount
      if (voucher.discountType === "PERCENT") {
        discountVoucher = (Number(total) * Number(voucher.discountValue)) / 100;
        if (voucher.maxDiscount) {
          discountVoucher = Math.min(
            discountVoucher,
            Number(voucher.maxDiscount)
          );
        }
      } else {
        discountVoucher = Number(voucher.discountValue);
      }
      voucherId = voucher.id;
    }

    // 🔐 TRANSACTION (IMPORTANT)
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          displayId: nextDisplayId,
          orderStatus,
          paymentMethod,
          paymentStatus,
          discount,
          oderFrom,
          total,
          discountVoucher,
          voucherId,
          pickupTime,
          voucherCode,
        },
      });

      if (voucherId) {
        // Only increment usage count (user already claimed the voucher)
        await tx.voucher.update({
          where: { id: voucherId },
          data: { usedCount: { increment: 1 } },
        });
      }

      return newOrder;
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("[ORDER_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const searchParams = new URL(req.url).searchParams;
    const userId = searchParams.get("userId");
    const orders = await prisma.order.findMany({
      where: { userId: userId || undefined },
      orderBy: { createdAt: "desc" },
      include: { user: true, voucher: true, orderItems: true },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("[ORDER_GET_ALL]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
