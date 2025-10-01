-- Add nutrition and health tracking fields to patients table
ALTER TABLE public.patients
ADD COLUMN age integer,
ADD COLUMN height numeric, -- in cm
ADD COLUMN weight numeric, -- in kg
ADD COLUMN target_weight numeric, -- in kg
ADD COLUMN body_fat_percentage numeric,
ADD COLUMN metabolic_age integer,
ADD COLUMN bmi numeric,
ADD COLUMN dietary_restrictions text,
ADD COLUMN activity_level text; -- e.g., 'sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'