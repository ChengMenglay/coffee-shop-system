import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const body = await req.json();
    const { name, email, phone, birthday, photoURL, gender, roleId, password } =
      body;
    const { accountId } = await params;

    if (!accountId)
      return new NextResponse("Account Id is required", { status: 400 });

    // Validate required fields
    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: accountId },
    });

    if (!existingUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check email uniqueness if email is being changed
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return new NextResponse("Email already in use", { status: 409 });
      }
    }

    // Build update data with proper null handling
    const updateData: any = {
      name,
      email: email || null,
      phone: phone || null,
      birthday: birthday || null,
      photoURL: photoURL || null,
      gender: gender || null,
      roleId: roleId || "cmjzk3lhs000ijr046z864d4w",
    };

    // Only update password if provided and meets minimum length
    if (password && password.length >= 6) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: accountId },
      data: updateData,
    });

    return NextResponse.json(user);
  } catch (error) {
    console.log("[ACCOUNT_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params;

    if (!accountId) {
      return new NextResponse("Account Id is required", { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: accountId },
      include: {
        orders: true,
        purchases: true,
        IngredientStocks: true,
        pendingPurchases: true,
        pendingStockUsages: true,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Prevent deletion if user has critical business records
    if (
      user.orders.length > 0 ||
      user.purchases.length > 0 ||
      user.IngredientStocks.length > 0
    ) {
      return new NextResponse(
        "Cannot delete user with existing orders, purchases, or stock records",
        { status: 409 }
      );
    }

    // Delete user and cascade deletable relations in a transaction
    await prisma.$transaction([
      // Delete favorites
      prisma.favorite.deleteMany({ where: { userId: accountId } }),
      // Delete voucher usages
      prisma.voucherUsage.deleteMany({ where: { userId: accountId } }),
      // Delete notifications
      prisma.notification.deleteMany({ where: { userId: accountId } }),
      // Update pending purchases (remove user reference)
      prisma.pendingPurchase.updateMany({
        where: { userId: accountId },
        data: { userId: accountId }, // Keep as is or set to a system user
      }),
      // Update pending stock usages (remove user reference)
      prisma.pendingStockUsage.updateMany({
        where: { userId: accountId },
        data: { userId: accountId }, // Keep as is or set to a system user
      }),
      // Update approved references to null
      prisma.pendingPurchase.updateMany({
        where: { approvedById: accountId },
        data: { approvedById: null },
      }),
      prisma.pendingStockUsage.updateMany({
        where: { approvedById: accountId },
        data: { approvedById: null },
      }),
      // Update feedback references
      prisma.feedback.updateMany({
        where: { updatedById: accountId },
        data: { updatedById: null },
      }),
      // Finally delete the user
      prisma.user.delete({ where: { id: accountId } }),
    ]);

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.log("[ACCOUNT_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
