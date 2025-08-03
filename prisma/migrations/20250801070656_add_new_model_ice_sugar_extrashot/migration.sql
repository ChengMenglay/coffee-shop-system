-- CreateTable
CREATE TABLE "Sugar" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sugar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ice" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtraShot" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceModifier" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExtraShot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProductToSugar" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductToSugar_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_IceToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_IceToProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ExtraShotToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ExtraShotToProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProductToSugar_B_index" ON "_ProductToSugar"("B");

-- CreateIndex
CREATE INDEX "_IceToProduct_B_index" ON "_IceToProduct"("B");

-- CreateIndex
CREATE INDEX "_ExtraShotToProduct_B_index" ON "_ExtraShotToProduct"("B");

-- AddForeignKey
ALTER TABLE "_ProductToSugar" ADD CONSTRAINT "_ProductToSugar_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToSugar" ADD CONSTRAINT "_ProductToSugar_B_fkey" FOREIGN KEY ("B") REFERENCES "Sugar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IceToProduct" ADD CONSTRAINT "_IceToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Ice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IceToProduct" ADD CONSTRAINT "_IceToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExtraShotToProduct" ADD CONSTRAINT "_ExtraShotToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "ExtraShot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExtraShotToProduct" ADD CONSTRAINT "_ExtraShotToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
