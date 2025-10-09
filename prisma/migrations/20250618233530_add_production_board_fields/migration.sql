-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('ONLINE', 'STORE');

-- CreateEnum
CREATE TYPE "OrderPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "boardNotes" TEXT,
ADD COLUMN     "estimatedCompletionDate" TIMESTAMP(3),
ADD COLUMN     "orderSource" "OrderSource" NOT NULL DEFAULT 'ONLINE',
ADD COLUMN     "priority" "OrderPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "productionCompletedAt" TIMESTAMP(3),
ADD COLUMN     "productionStartedAt" TIMESTAMP(3);
