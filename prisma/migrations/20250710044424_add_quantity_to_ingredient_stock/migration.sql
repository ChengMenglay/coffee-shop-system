/*
  Warnings:

  - Added the required column `quantity` to the `IngredientStock` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IngredientStock" ADD COLUMN     "quantity" INTEGER NOT NULL;
