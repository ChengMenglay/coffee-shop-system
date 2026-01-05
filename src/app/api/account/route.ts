import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, name, email, phone, birthday, gender, password, photoURL } =
      body;

    // Validation
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
    }

    // Create user with default role
    const user = await prisma.user.create({
      data: {
        id,
        name,
        email: email || null,
        phone: phone || null,
        birthday: birthday || null,
        gender: gender || null,
        password: password ? await bcrypt.hash(password, 10) : "",
        photoURL: photoURL || null,
        roleId: "cmjzk3lhs000ijr046z864d4w",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        birthday: true,
        gender: true,
        photoURL: true,
        roleId: true,
        createdAt: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("[ACCOUNT_POST]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        birthday: true,
        photoURL: true,
        roleId: true,
        createdAt: true,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.log("[ACCOUNT_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
