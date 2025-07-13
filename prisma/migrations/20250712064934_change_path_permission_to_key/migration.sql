/*
  Warnings:

  - You are about to drop the column `path` on the `Permission` table. All the data in the column will be lost.
  - Added the required column `key` to the `Permission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "path",
ADD COLUMN     "key" TEXT NOT NULL;
