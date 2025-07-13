import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { accountId: string } }
) {
  try {
    const body = await req.json();
    const { name, phone, roleId, password } = body;
    if (!params.accountId)
      return new NextResponse("Account Id is required", { status: 400 });
    if (!name) return NextResponse.json("Name is required", { status: 400 });
    if (!phone) return NextResponse.json("Phone is required", { status: 400 });
    if (!roleId)
      return NextResponse.json("Role Id is required", { status: 400 });
    const updateData: any = {
      name,
      phone,
      roleId,
    };

if (password && password.length >= 6) {
  const hashed = await bcrypt.hash(password, 10);
  updateData.password = hashed;
}
const user = await prisma.user.update({
  where: { id: params.accountId },
  data: updateData,
});
    return NextResponse.json(user);
  } catch (error) {
    console.log("ACCOUNT_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { accountId: string } }
) {
  try {
    const { accountId } = params;

    if (!accountId) {
      return new NextResponse("Account Id is required", { status: 400 });
    }

    const deletedUser = await prisma.user.delete({
      where: { id: accountId },
    });

    return NextResponse.json(deletedUser);
  } catch (error) {
    console.log("[ACCOUNT_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
