/*
  Warnings:

  - A unique constraint covering the columns `[elementId]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Chat" ALTER COLUMN "elementId" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Chat_elementId_key" ON "Chat"("elementId");
