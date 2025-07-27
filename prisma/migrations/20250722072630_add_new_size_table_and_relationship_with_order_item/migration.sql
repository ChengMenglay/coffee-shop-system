/*
  Warnings:

  - You are about to drop the column `size` on the `OrderItem` table. All the data in the column will be lost.
  - Added the required column `sizeId` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "size",
ADD COLUMN     "sizeId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Size" (
    "id" TEXT NOT NULL,
    "sizeName" TEXT NOT NULL,
    "priceModifier" DECIMAL(65,30) NOT NULL,
    "productId" TEXT NOT NULL,
    "fullPrice" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Size_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Size" ADD CONSTRAINT "Size_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
