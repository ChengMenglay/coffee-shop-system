import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";



export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const body = await req.json();
    const { name, email, phone, birthday, photoURL, roleId, password } = body;
    const { accountId } = await params;
    if (!accountId)
      return new NextResponse("Account Id is required", { status: 400 });

    const updateData: {
      name: string;
      email: string;
      phone: string;
      birthday: string;
      photoURL: string;
      roleId: string;
      password?: string;
    } = {
      name,
      email,
      phone,
      birthday,
      photoURL,
      roleId,
    };

    if (password && password.length >= 6) {
      const hashed = await bcrypt.hash(password, 10);
      updateData.password = hashed;
    }
    const user = await prisma.user.update({
      where: { id: accountId },
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
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    const { accountId } = await params;

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
