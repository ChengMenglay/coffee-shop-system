import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { notificationId: string } }
) {
  try {
    const { notificationId } = await params;
    const body = await req.json();
    const { read } = body;
    if (!notificationId || !read) {
      return NextResponse.json("Missing required fields", { status: 400 });
    }
    const notification = prisma.notification.update({
      where: { id: notificationId },
      data: { read },
    });
    return NextResponse.json(notification);
  } catch (error) {
    console.error("[NOTIFICATION PATCH]", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { notificationId: string } }
) {
  try {
    const { notificationId } = await params;

    if (!notificationId) {
      return new NextResponse("Notification Id is required", { status: 400 });
    }


    const notification = await prisma.notification.delete({
      where: { id: notificationId },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.log("[NOTIFICAION_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
