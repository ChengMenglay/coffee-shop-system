import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ promotionId: string }> }
) {
  try {
    const body = await req.json();
    const { name, type, buyQuantity, freeQuantity, discount, startDate, endDate, isActive } = body;
    const { promotionId } = await params;
    if (!promotionId)
      return NextResponse.json("Promotion id is required!", { status: 4000 });
      if(!name) {
     return NextResponse.json("Promotion name is required", { status: 400 })
   }
   if(!type) {
     return NextResponse.json("Promotion type is required", { status: 400 })
   }
   if(!startDate) {
     return NextResponse.json("Start date is required", { status: 400 })
   }
   if(!endDate) {
     return NextResponse.json("End date is required", { status: 400 })
   }
   if(isActive === undefined) {
     return NextResponse.json("isActive is required", { status: 400 })
   }
    const promotion = await prisma.promotion.update({
      where: { id: promotionId },
      data: { name, type, buyQuantity, freeQuantity, discount, startDate, endDate, isActive },
    });
    return NextResponse.json(promotion);
  } catch (error) {
    console.log("[PROMOTION_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ promotionId: string }> }
) {
  try {
    const { promotionId } = await params;
    if (!promotionId) return NextResponse.json("Promotion Id is required!");
    const promotion = await prisma.promotion.delete({
      where: { id: promotionId },
    });
    return NextResponse.json(promotion);
  } catch (error) {
    console.log("[PROMOTION_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
