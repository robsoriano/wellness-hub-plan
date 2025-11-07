-- Fix Critical Security Issues: RLS Policies

-- ============================================
-- 1. FIX PROFILES TABLE - Remove Public Access
-- ============================================

-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create restrictive policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "View related user profiles (patient-nutritionist relationship)"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE (patients.patient_id = profiles.id AND patients.nutritionist_id = auth.uid())
         OR (patients.nutritionist_id = profiles.id AND patients.patient_id = auth.uid())
    )
  );

-- Keep existing UPDATE policy but ensure role cannot be changed
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile (except role)"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- ============================================
-- 2. FIX PATIENTS TABLE - Clarify Access Control
-- ============================================

-- Drop the existing policy
DROP POLICY IF EXISTS "Nutritionists can view their patients" ON public.patients;

-- Create separate, clear policies
CREATE POLICY "Nutritionists can view their assigned patients"
  ON public.patients
  FOR SELECT
  USING (auth.uid() = nutritionist_id);

CREATE POLICY "Patients can view their own records"
  ON public.patients
  FOR SELECT
  USING (auth.uid() = patient_id);

-- ============================================
-- 3. FIX NOTIFICATIONS TABLE - Remove Public Insert
-- ============================================

-- Drop the dangerous public INSERT policy
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Create a security definer function for safe notification creation
CREATE OR REPLACE FUNCTION public.create_notification(
  target_user_id uuid,
  notification_type text,
  notification_title text,
  notification_message text,
  notification_related_id uuid DEFAULT NULL
)
RETURNS uuid
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  new_notification_id uuid;
BEGIN
  -- Basic authorization: ensure the caller has a relationship with the target user
  -- Either they're creating a notification for themselves, or they're a nutritionist for that patient
  IF auth.uid() != target_user_id THEN
    IF NOT EXISTS (
      SELECT 1 FROM patients
      WHERE (nutritionist_id = auth.uid() AND patient_id = target_user_id)
         OR (patient_id = auth.uid() AND nutritionist_id = target_user_id)
    ) THEN
      RAISE EXCEPTION 'Unauthorized: Cannot create notification for unrelated user';
    END IF;
  END IF;

  -- Insert the notification
  INSERT INTO notifications (user_id, type, title, message, related_id)
  VALUES (target_user_id, notification_type, notification_title, notification_message, notification_related_id)
  RETURNING id INTO new_notification_id;

  RETURN new_notification_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_notification TO authenticated;

-- Add comment explaining the function
COMMENT ON FUNCTION public.create_notification IS 
  'Securely creates notifications. Only allows creating notifications for yourself or related users (patient-nutritionist relationships).';

-- ============================================
-- 4. ADD DATABASE CONSTRAINTS FOR INPUT VALIDATION
-- ============================================

-- Drop existing constraints if they exist
DO $$ BEGIN
  ALTER TABLE public.recipes DROP CONSTRAINT IF EXISTS recipe_name_length;
  ALTER TABLE public.recipes DROP CONSTRAINT IF EXISTS recipe_description_length;
  ALTER TABLE public.recipes DROP CONSTRAINT IF EXISTS recipe_instructions_length;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add length constraints to recipes table
ALTER TABLE public.recipes
  ADD CONSTRAINT recipe_name_length CHECK (length(name) <= 200);

ALTER TABLE public.recipes
  ADD CONSTRAINT recipe_description_length CHECK (description IS NULL OR length(description) <= 500);

ALTER TABLE public.recipes
  ADD CONSTRAINT recipe_instructions_length CHECK (instructions IS NULL OR length(instructions) <= 5000);

-- Drop existing constraints if they exist
DO $$ BEGIN
  ALTER TABLE public.meal_plans DROP CONSTRAINT IF EXISTS meal_plan_title_length;
  ALTER TABLE public.meal_plans DROP CONSTRAINT IF EXISTS meal_plan_description_length;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add length constraints to meal_plans table
ALTER TABLE public.meal_plans
  ADD CONSTRAINT meal_plan_title_length CHECK (length(title) <= 200);

ALTER TABLE public.meal_plans
  ADD CONSTRAINT meal_plan_description_length CHECK (description IS NULL OR length(description) <= 500);

-- Drop existing constraints if they exist
DO $$ BEGIN
  ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS message_content_length;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add length constraint to messages table
ALTER TABLE public.messages
  ADD CONSTRAINT message_content_length CHECK (length(message) <= 2000);

-- Drop existing constraints if they exist
DO $$ BEGIN
  ALTER TABLE public.progress_logs DROP CONSTRAINT IF EXISTS progress_log_notes_length;
  ALTER TABLE public.progress_logs DROP CONSTRAINT IF EXISTS progress_log_mood_length;
  ALTER TABLE public.progress_logs DROP CONSTRAINT IF EXISTS progress_log_weight_range;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add constraints to progress_logs table
ALTER TABLE public.progress_logs
  ADD CONSTRAINT progress_log_notes_length CHECK (notes IS NULL OR length(notes) <= 1000);

ALTER TABLE public.progress_logs
  ADD CONSTRAINT progress_log_mood_length CHECK (mood IS NULL OR length(mood) <= 50);

ALTER TABLE public.progress_logs
  ADD CONSTRAINT progress_log_weight_range CHECK (weight IS NULL OR (weight >= 20 AND weight <= 500));

-- Drop existing constraints if they exist
DO $$ BEGIN
  ALTER TABLE public.patients DROP CONSTRAINT IF EXISTS patient_weight_range;
  ALTER TABLE public.patients DROP CONSTRAINT IF EXISTS patient_height_range;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add constraints to patients table
ALTER TABLE public.patients
  ADD CONSTRAINT patient_weight_range CHECK (weight IS NULL OR (weight >= 20 AND weight <= 500));

ALTER TABLE public.patients
  ADD CONSTRAINT patient_height_range CHECK (height IS NULL OR (height >= 50 AND height <= 300));