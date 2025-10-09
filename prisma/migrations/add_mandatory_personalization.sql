-- Add mandatory_personalization column to print_areas table
ALTER TABLE "print_areas" ADD COLUMN "mandatory_personalization" BOOLEAN NOT NULL DEFAULT false;