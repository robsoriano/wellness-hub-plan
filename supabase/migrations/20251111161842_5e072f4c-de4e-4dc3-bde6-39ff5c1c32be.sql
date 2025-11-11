-- Add muscle_percentage and body_fat_percentage columns to progress_logs table
ALTER TABLE public.progress_logs
ADD COLUMN muscle_percentage numeric,
ADD COLUMN body_fat_percentage numeric;