/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."FeedbackCategory" AS ENUM ('PRODUCT', 'SERVICE', 'APP_FUNCTIONALITY', 'STAFF', 'ENVIRONMENT', 'SECURITY', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."FeedbackStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'RESOLVED', 'REJECTED');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "birthday" TIMESTAMP(3),
ADD COLUMN     "email" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "photoURL" TEXT;

-- CreateTable
CREATE TABLE "public"."Feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT,
    "category" "public"."FeedbackCategory" NOT NULL,
    "description" VARCHAR(150) NOT NULL,
    "images" TEXT[],
    "status" "public"."FeedbackStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Feedback_userId_idx" ON "public"."Feedback"("userId");

-- CreateIndex
CREATE INDEX "Feedback_orderId_idx" ON "public"."Feedback"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Feedback" ADD CONSTRAINT "Feedback_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
