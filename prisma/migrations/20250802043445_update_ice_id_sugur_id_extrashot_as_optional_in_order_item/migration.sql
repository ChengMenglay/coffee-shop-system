-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_iceId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_sizeId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_sugarId_fkey";

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "discount" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ice" TEXT,
ALTER COLUMN "sizeId" DROP NOT NULL,
ALTER COLUMN "iceId" DROP NOT NULL,
ALTER COLUMN "sugarId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Size"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_sugarId_fkey" FOREIGN KEY ("sugarId") REFERENCES "Sugar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_iceId_fkey" FOREIGN KEY ("iceId") REFERENCES "Ice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
