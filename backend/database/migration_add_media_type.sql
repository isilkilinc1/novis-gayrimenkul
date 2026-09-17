-- Migration: Add media_type to property_images
-- Idempotent and backward-compatible

ALTER TABLE property_images 
ADD COLUMN IF NOT EXISTS media_type VARCHAR(20) DEFAULT 'image';
