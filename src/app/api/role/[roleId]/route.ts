import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(request:Request, { params }: { params: { roleId: string } }) {
  try {
    const body = await request.json();
    const { name, permissions } = body;
const { roleId } = await params;
    if (!roleId) {
      return new NextResponse("Role Id is required", { status: 400 });
    }
    if (!name) {
      return NextResponse.json("Name is required", { status: 400 });
    }
    if (!permissions || permissions.length === 0) {
      return NextResponse.json("At least one permission is required", { status: 400 });
    }

    const role = await prisma.role.update({
      where: { id: roleId },
      data: {
        name,
        permissions: {
          set: permissions.map((permissionId: string) => ({ id: permissionId })),
        },
      },
    });

    return NextResponse.json(role);
  } catch (error) {
    console.log("[ROLE_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { roleId: string } }) {
  try {
    const { roleId } = await params;

    if (!roleId) {
      return new NextResponse("Role Id is required", { status: 400 });
    }

    const deletedRole = await prisma.role.delete({
      where: { id: roleId },
    });

    return NextResponse.json(deletedRole);
  } catch (error) {
    console.log("[ROLE_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}