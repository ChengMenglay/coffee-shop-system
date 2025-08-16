import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server"


export async function POST(req:Request) {
  try {
   const body = await req.json();
   const {name, type, buyQuantity, freeQuantity, discount, startDate, endDate, isActive} = body;
   if(!name) {
     return NextResponse.json("Promotion name is required", { status: 400 })
   }
   if(!type) {
     return NextResponse.json("Promotion type is required", { status: 400 })
   }
   if(!startDate) {
     return NextResponse.json("Start date is required", { status: 400 })
   }
   if(!endDate) {
     return NextResponse.json("End date is required", { status: 400 })
   }
   if(isActive === undefined) {
     return NextResponse.json("isActive is required", { status: 400 })
   }
   const promotion = await prisma.promotion.create({
     data: {
       name,
       type,
       buyQuantity,
       freeQuantity,
       discount,
       startDate,
       endDate,
       isActive
     }
   });
   return NextResponse.json(promotion)
  } catch (error) {
    console.log("[PROMOTION_POST]", error)
    return NextResponse.json("Internal Server Error", { status: 500 })
  }
}