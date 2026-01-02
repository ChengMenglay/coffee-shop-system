import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET single voucher
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ voucherId: string }> }
) {
  try {
    const { voucherId } = await params;
    const voucher = await prisma.voucher.findUnique({
      where: { id: voucherId },
    });
    if (!voucher)
      return NextResponse.json({ error: "Voucher not found" }, { status: 404 });
    return NextResponse.json(voucher);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch voucher" },
      { status: 500 }
    );
  }
}

// PATCH update voucher
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ voucherId: string }> }
) {
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

    const { voucherId } = await params;
    if (!code || !discountType || !discountValue || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updatedVoucher = await prisma.voucher.update({
      where: { id: voucherId },
      data: {
        code,
        description: description || null,
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderTotal: minOrderTotal ? parseFloat(minOrderTotal) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        usageLimit: usageLimit || null,
        perUserLimit: perUserLimit || null,
        isActive: isActive,
      },
    });
    return NextResponse.json(updatedVoucher);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Voucher not found" }, { status: 404 });
    }
    console.error("Update voucher error:", error);
    return NextResponse.json(
      { error: "Failed to update voucher" },
      { status: 500 }
    );
  }
}

// DELETE voucher
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ voucherId: string }> }
) {
  try {
    const { voucherId } = await params;
    await prisma.voucher.delete({
      where: { id: voucherId },
    });
    return NextResponse.json({ message: "Voucher deleted successfully" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Voucher not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete voucher" },
      { status: 500 }
    );
  }
}
