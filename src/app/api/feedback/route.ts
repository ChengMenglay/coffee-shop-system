import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const feedbacks = await prisma.feedback.findMany({
      include: { user: true, order: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(feedbacks);
  } catch (error) {
    console.log("[FEEDBACK_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      orderId,
      category,
      description,
      status,
      images = [],
    } = body;
    if (!userId || !category || !description) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    await prisma.feedback.create({
      data: {
        userId,
        orderId: orderId || null,
        category,
        description,
        images,
        status: status || "PENDING",
      },
    });
    return NextResponse.json({
      success: true,
      message: "Thank you for your feedback!",
    });
  } catch (error) {
    console.log("[FEEDBACK_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
