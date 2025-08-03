/*
  Warnings:

  - You are about to drop the `_ExtraShotToProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_IceToProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ProductToSugar` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `productId` to the `ExtraShot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `Ice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `Sugar` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_ExtraShotToProduct" DROP CONSTRAINT "_ExtraShotToProduct_A_fkey";

-- DropForeignKey
ALTER TABLE "_ExtraShotToProduct" DROP CONSTRAINT "_ExtraShotToProduct_B_fkey";

-- DropForeignKey
ALTER TABLE "_IceToProduct" DROP CONSTRAINT "_IceToProduct_A_fkey";

-- DropForeignKey
ALTER TABLE "_IceToProduct" DROP CONSTRAINT "_IceToProduct_B_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToSugar" DROP CONSTRAINT "_ProductToSugar_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToSugar" DROP CONSTRAINT "_ProductToSugar_B_fkey";

-- AlterTable
ALTER TABLE "ExtraShot" ADD COLUMN     "productId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Ice" ADD COLUMN     "productId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Sugar" ADD COLUMN     "productId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_ExtraShotToProduct";

-- DropTable
DROP TABLE "_IceToProduct";

-- DropTable
DROP TABLE "_ProductToSugar";

-- AddForeignKey
ALTER TABLE "Sugar" ADD CONSTRAINT "Sugar_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ice" ADD CONSTRAINT "Ice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraShot" ADD CONSTRAINT "ExtraShot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
