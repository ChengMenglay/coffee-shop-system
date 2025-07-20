import { getUploadDir } from "@/lib/uploadConfig";
import { existsSync } from "fs";
import { unlink, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

function sanitizeFilename(filename: string): string {
  // Remove or replace problematic characters
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, "_") // Replace non-alphanumeric chars with underscores
    .replace(/_{2,}/g, "_") // Replace multiple underscores with single
    .replace(/^_|_$/g, ""); // Remove leading/trailing underscores
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) return NextResponse.json("No file uploaded", { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = getUploadDir();
  const safeName = sanitizeFilename(file.name);
  const uniqueFilename = `${Date.now()}-${safeName}`;
  const filePath = path.join(uploadDir, uniqueFilename);

  await writeFile(filePath, buffer);
  return NextResponse.json({
    success: true,
    filename: uniqueFilename,
    originalName: file.name,
  });
}
export async function DELETE(req: Request) {
  try {
    const { filename } = await req.json();

    if (!filename) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      );
    }

    const uploadDir = getUploadDir();
    const filePath = path.join(uploadDir, filename);

    // Check if file exists before trying to delete
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    await unlink(filePath);

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Delete failed:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
