-- Migration: 20250907_staff_manager_location.sql
-- Description: Adds manager and location_key columns to staff table with appropriate indexes
-- Purpose: Enable manager relationship tracking and structured location references

-- Add manager column (nullable text field to store manager names)
ALTER TABLE staff
ADD COLUMN manager text;

-- Add location_key column (nullable text field for structured location references)
ALTER TABLE staff
ADD COLUMN location_key text;

-- Create case-insensitive index on manager column for efficient manager-based filtering
CREATE INDEX idx_staff_manager_lower ON staff (lower(manager));

-- Create index on location_key for efficient location-based filtering
CREATE INDEX idx_staff_location_key ON staff (location_key);

-- Add comment explaining the purpose of these columns
COMMENT ON COLUMN staff.manager IS 'The name of the staff member''s manager';
COMMENT ON COLUMN staff.location_key IS 'Structured reference key for the staff member''s primary work location';
