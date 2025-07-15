import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { permissionId: string } }
) {
  try {
    const { permissionId } = await params;
    if (!permissionId)
      return new NextResponse("Permission Id is required", { status: 400 });
    const permission = await prisma.permission.findUnique({
      where: { id: params.permissionId },
    });
    return NextResponse.json(permission);
  } catch (error) {
    console.log("[PERMISSION_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { permissionId: string } }
) {
  try {
    const { permissionId } = await params;
    const body = await req.json();
    const { name, key } = body;
    if (!permissionId)
      return new NextResponse("Permission Id is required", { status: 400 });
    if (!name) return NextResponse.json("Name is required", { status: 400 });
    if (!key) return NextResponse.json("Key is required", { status: 400 });
    const permission = await prisma.permission.update({
      where: { id: permissionId },
      data: { name, key },
    });
    return NextResponse.json(permission);
  } catch (error) {
    console.log("PERMISSION_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { permissionId: string } }
) {
  try {
    const { permissionId } = await params;
    if (!permissionId)
      return new NextResponse("Permission Id is required", { status: 400 });
    const permission = await prisma.permission.delete({
      where: { id: permissionId },
    });
    return NextResponse.json(permission);
  } catch (error) {
    console.log("[PERMISSION_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
