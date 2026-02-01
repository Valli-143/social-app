-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "updatedAt" DROP DEFAULT;
