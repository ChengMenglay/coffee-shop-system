-- DropIndex
DROP INDEX "public"."VoucherUsage_voucherId_userId_key";

-- CreateIndex
CREATE INDEX "VoucherUsage_userId_idx" ON "public"."VoucherUsage"("userId");
