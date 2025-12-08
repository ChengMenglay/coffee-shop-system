import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ announcementId: string }> }
) {
  try {
    const body = await req.json();
    const { title, content, image, isActive } = body;
    const { announcementId } = await params;
    if (!announcementId)
      return NextResponse.json("Announcement id is required!", { status: 4000 });
    if (!title) return NextResponse.json("Title is required!", { status: 400 });
    if (!content) return NextResponse.json("Content is required!", { status: 400 });
    const announcement = await prisma.announcement.update({
      where: { id: announcementId },
      data: { title, content, image, isActive },
    });
    return NextResponse.json(announcement);
  } catch (error) {
    console.log("[ANNOUNCEMENT_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ announcementId: string }> }
) {
  try {
    const { announcementId } = await params;
    if (!announcementId) return NextResponse.json("Announcement Id is required!");
    const announcement = await prisma.announcement.delete({
      where: { id: announcementId },
    });
    return NextResponse.json(announcement);
  } catch (error) {
    console.log("[ANNOUNCEMENT_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
