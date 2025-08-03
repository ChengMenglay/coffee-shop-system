/*
  Warnings:

  - You are about to drop the column `sugar` on the `OrderItem` table. All the data in the column will be lost.
  - Added the required column `iceId` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sugarId` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "sugar",
ADD COLUMN     "extraShotId" TEXT,
ADD COLUMN     "iceId" TEXT NOT NULL,
ADD COLUMN     "sugarId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_sugarId_fkey" FOREIGN KEY ("sugarId") REFERENCES "Sugar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_iceId_fkey" FOREIGN KEY ("iceId") REFERENCES "Ice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_extraShotId_fkey" FOREIGN KEY ("extraShotId") REFERENCES "ExtraShot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
