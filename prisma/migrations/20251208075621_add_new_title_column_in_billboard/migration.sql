/*
  Warnings:

  - Added the required column `title` to the `Billboard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Billboard" ADD COLUMN     "title" TEXT NOT NULL;
