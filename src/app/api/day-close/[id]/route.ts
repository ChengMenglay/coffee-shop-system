import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Delete a specific day close record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json("Day close ID is required", { status: 400 });
    }

    // Check if the day close record exists
    const existingDayClose = await prisma.dayClose.findUnique({
      where: { id },
    });

    if (!existingDayClose) {
      return NextResponse.json("Day close record not found", { status: 404 });
    }

    // Delete the day close record
    await prisma.dayClose.delete({
      where: { id },
    });

    console.log(
      `[DAY_CLOSE_DELETE] Successfully deleted day close record: ${id}`
    );

    return NextResponse.json({
      message: "Day close record deleted successfully",
      deletedId: id,
    });
  } catch (error) {
    console.error("[DAY_CLOSE_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
