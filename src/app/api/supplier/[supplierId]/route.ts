import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ supplierId: string }> }
) {
  try {
    const { supplierId } = await params;
    if (!supplierId)
      return new NextResponse("Supplier Id is required", { status: 400 });
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });
    return NextResponse.json(supplier);
  } catch (error) {
    console.log("[SUPPLIER_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ supplierId: string }> }
) {
  try {
    const { supplierId } = await params;
    const body = await req.json();
    if (!supplierId)
      return new NextResponse("Supplier Id is required", { status: 400 });
    const { name, contact, isActive, suppliedIngredients } = body;
    if (!name) return NextResponse.json("Name is required", { status: 400 });
    if (!contact)
      return NextResponse.json("contact is required", { status: 400 });
    if (!Array.isArray(suppliedIngredients) || !suppliedIngredients.length) {
      return NextResponse.json("Ingredients supplied is required", {
        status: 400,
      });
    }
    const supplier = await prisma.supplier.update({
      where: { id: supplierId },
      data: {
        name,
        contact,
        isActive,
        suppliedIngredients: {
          set: suppliedIngredients.map((ingredientId) => ({
            id: ingredientId,
          })),
        },
      },
    });
    return NextResponse.json(supplier);
  } catch (error) {
    console.log("[SUPPLIER_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ supplierId: string }> }
) {
  try {
    const { supplierId } = await params;
    if (!supplierId)
      return new NextResponse("Supplier Id is required", { status: 400 });
    const supplier = await prisma.supplier.delete({
      where: { id: supplierId },
    });
    return NextResponse.json(supplier);
  } catch (error) {
    console.log("[SUPPLIER_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
