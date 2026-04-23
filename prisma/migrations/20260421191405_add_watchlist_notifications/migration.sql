-- AlterTable
ALTER TABLE "watchlists" ADD COLUMN     "notify_on_drop" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notify_on_rise" BOOLEAN NOT NULL DEFAULT false;
