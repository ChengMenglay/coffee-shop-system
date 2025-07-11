import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { purchaseId: string } }
) {
  try {
    if (!params.purchaseId) {
      return NextResponse.json("Purchase id is required", { status: 400 });
    }
    const purchase = await prisma.purchase.findUnique({
      where: { id: params.purchaseId },
    });
    return NextResponse.json(purchase);
  } catch (error) {
    console.log("[PURCHASES_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { purchaseId: string } }
) {
  try {
    const body = await req.json();
    const { ingredientId, quantity, price, supplier } = body;
    if (!params.purchaseId)
      return NextResponse.json("Purchase id is required", { status: 400 });
    if (!ingredientId)
      return NextResponse.json("ingredient id is required", { status: 400 });
    if (!quantity)
      return NextResponse.json("quantity is required", { status: 400 });
    if (!price) return NextResponse.json("Price is required", { status: 400 });

    if (!supplier)
      return NextResponse.json("Supplier is required", { status: 400 });
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId },
    });
    const purchaseData = await prisma.purchase.findUnique({
      where: { id: params.purchaseId },
    });
    await prisma.ingredient.update({
      where: { id: ingredientId },
      data: {
        stock:
          Number(ingredient?.stock) - Number(purchaseData?.quantity) + quantity,
      },
    });
    const purchase = await prisma.purchase.update({
      where: { id: params.purchaseId },
      data: { ingredientId, quantity, price, supplier },
    });
    return NextResponse.json(purchase);
  } catch (error) {
    console.log("[PURCHASES_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { purchaseId: string } }
) {
  try {
    if (!params.purchaseId)
      return NextResponse.json("Purchase id is required", { status: 400 });
    const purchaseData = await prisma.purchase.findUnique({
      where: { id: params.purchaseId },
    });
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: purchaseData?.ingredientId },
    });
    await prisma.ingredient.update({
      where: { id: purchaseData?.ingredientId },
      data: {
        stock: Number(ingredient?.stock) - Number(purchaseData?.quantity),
      },
    });
    const purchase = await prisma.purchase.delete({
      where: { id: params.purchaseId },
    });
    return NextResponse.json(purchase);
  } catch (error) {
    console.log("[PURCHASE_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
