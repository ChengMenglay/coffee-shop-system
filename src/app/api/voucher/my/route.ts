import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const vouchers = await prisma.voucherUsage.findMany({
    where: { userId },
    include: {
      voucher: true,
    },
    orderBy: { usedAt: "desc" },
  });

  return NextResponse.json(vouchers);
}
