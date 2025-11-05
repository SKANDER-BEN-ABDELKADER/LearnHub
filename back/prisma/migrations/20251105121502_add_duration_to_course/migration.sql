-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "duration" INTEGER;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "profilePicUrl" SET DEFAULT '/uploads/user icon.png';
