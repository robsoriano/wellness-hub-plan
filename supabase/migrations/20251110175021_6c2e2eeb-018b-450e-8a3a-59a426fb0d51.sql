-- Add new columns to patients table for muscle percentage, allergies, and pathologies
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS muscle_percentage numeric,
ADD COLUMN IF NOT EXISTS allergies text,
ADD COLUMN IF NOT EXISTS pathologies text;