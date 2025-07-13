import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request){
    try {
        const body = await request.json();
        const {name, permissions}= body;
        if (!name) {
            return NextResponse.json("Name is required", { status: 400 });
        }
        if (!permissions || permissions.length === 0) {
            return NextResponse.json("At least one permission is required", { status: 400 });
        }
        const role = await prisma.role.create({
            data: {
                name,
                permissions: {
                    connect: permissions.map((permissionId: string) => ({ id: permissionId })),
                },
            },
        });
        return NextResponse.json(role);
    } catch (error) {
        console.log("[ROLE_POST]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}