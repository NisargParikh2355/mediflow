-- CreateEnum
CREATE TYPE "DoctorVerificationStatus" AS ENUM ('NOT_APPLICABLE', 'PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "doctorVerificationStatus" "DoctorVerificationStatus" NOT NULL DEFAULT 'NOT_APPLICABLE';
