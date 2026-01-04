import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ feedbackId: string }> }
) {
  try {
    const { feedbackId } = await params;
    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
      include: { user: true, order: true, updatedBy: true },
    });
    if (!feedback)
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    return NextResponse.json(feedback);
  } catch (error) {
    console.log("[FEEDBACK_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ feedbackId: string }> }
) {
  try {
    const body = await req.json();
    const { status, updatedBy } = body;
    const { feedbackId } = await params;
    if (!feedbackId) {
      return NextResponse.json(
        { error: "Feedback ID is required" },
        { status: 400 }
      );
    }
    if (!status || !updatedBy) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const updatedFeedback = await prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        status,
        updatedById: updatedBy,
      },
    });
    return NextResponse.json({
      success: true,
      message: "Feedback updated successfully",
    });
  } catch (error) {
    console.log("[FEEDBACK_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ feedbackId: string }> }
) {
  try {
    const { feedbackId } = await params;
    await prisma.feedback.delete({
      where: { id: feedbackId },
    });
    return NextResponse.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.log("[FEEDBACK_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
