-- CreateTable
CREATE TABLE "public"."DayClose" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalSales" DECIMAL(65,30) NOT NULL,
    "totalOrders" INTEGER NOT NULL,
    "totalCustomers" INTEGER NOT NULL,
    "cashSales" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "abaSales" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "creditCardSales" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "topProducts" TEXT,
    "promotionsUsed" TEXT,
    "lowStockItems" TEXT,
    "hourlyBreakdown" TEXT,
    "notes" TEXT,
    "closedBy" TEXT,
    "closedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DayClose_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DayClose_date_key" ON "public"."DayClose"("date");
