-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'Canada',
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'CAD',
ADD COLUMN     "locale" TEXT NOT NULL DEFAULT 'en-CA';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'Canada',
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'CAD',
ADD COLUMN     "locale" TEXT NOT NULL DEFAULT 'en-CA',
ADD COLUMN     "province" TEXT;
