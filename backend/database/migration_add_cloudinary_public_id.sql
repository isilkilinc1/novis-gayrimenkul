-- Migration: Add cloudinary_public_id to property_images
-- Idempotent and backward-compatible

ALTER TABLE property_images 
ADD COLUMN IF NOT EXISTS cloudinary_public_id VARCHAR(255) DEFAULT NULL;
