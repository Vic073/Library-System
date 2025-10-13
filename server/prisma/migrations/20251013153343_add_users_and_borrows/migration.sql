/*
  Warnings:

  - You are about to drop the column `availableCopies` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `totalCopies` on the `Book` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `BorrowRecord` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[isbn]` on the table `Book` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `isbn` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."BorrowRecord" DROP CONSTRAINT "BorrowRecord_bookId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BorrowRecord" DROP CONSTRAINT "BorrowRecord_userId_fkey";

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "availableCopies",
DROP COLUMN "category",
DROP COLUMN "totalCopies",
ADD COLUMN     "available" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isbn" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'student';

-- DropTable
DROP TABLE "public"."BorrowRecord";

-- DropEnum
DROP TYPE "public"."Role";

-- DropEnum
DROP TYPE "public"."Status";

-- CreateTable
CREATE TABLE "Borrow" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,
    "borrowedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returned" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Borrow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Book_isbn_key" ON "Book"("isbn");

-- AddForeignKey
ALTER TABLE "Borrow" ADD CONSTRAINT "Borrow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Borrow" ADD CONSTRAINT "Borrow_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
