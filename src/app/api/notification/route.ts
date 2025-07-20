import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, type, message, read ,title} = body;
    if (!userId || !type || !message || !title) {
      return NextResponse.json("Missing required fields", { status: 400 });
    }
    const notification = await prisma.notification.create({
      data: { userId, type, message, read,title },
    });
    return NextResponse.json(notification);
  } catch (error) {
    console.error("[NOTIFICATION POST]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { read, userId } = body;
    if (!read) return NextResponse.json("Read is required", { status: 400 });
    if (!userId) {
      return new NextResponse("User Id is required", { status: 400 });
    }
    const notification = await prisma.notification.updateMany({
      where: { userId },
      data: { read },
    });
    return NextResponse.json(notification);
  } catch (error) {
    console.error("[NOTIFICATION PUT]", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
