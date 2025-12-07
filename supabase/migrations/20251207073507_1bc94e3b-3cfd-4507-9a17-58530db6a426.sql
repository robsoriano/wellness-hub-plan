-- Drop existing function first
DROP FUNCTION IF EXISTS public.create_notification(uuid, text, text, text, uuid);
DROP FUNCTION IF EXISTS public.create_notification(uuid, text, text, text);

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_related_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, related_id)
  VALUES (p_user_id, p_type, p_title, p_message, p_related_id);
END;
$$;

-- Trigger: Notify patient when new meal plan is created
CREATE OR REPLACE FUNCTION public.notify_new_meal_plan()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.create_notification(
    NEW.patient_id,
    'meal_plan',
    'New Meal Plan',
    'A new meal plan "' || NEW.title || '" has been created for you.',
    NEW.patient_id
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_meal_plan_created ON public.meal_plans;
CREATE TRIGGER on_meal_plan_created
AFTER INSERT ON public.meal_plans
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_meal_plan();

-- Trigger: Notify patient when appointment is scheduled
CREATE OR REPLACE FUNCTION public.notify_new_appointment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.create_notification(
    NEW.patient_id,
    'appointment',
    'Appointment Scheduled',
    'You have an appointment on ' || TO_CHAR(NEW.appointment_date, 'Mon DD, YYYY') || ' at ' || TO_CHAR(NEW.appointment_time, 'HH12:MI AM'),
    NEW.id
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_appointment_created ON public.appointments;
CREATE TRIGGER on_appointment_created
AFTER INSERT ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_appointment();

-- Trigger: Notify when new message is received
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_name text;
BEGIN
  SELECT full_name INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;
  
  PERFORM public.create_notification(
    NEW.receiver_id,
    'message',
    'New Message',
    COALESCE(sender_name, 'Someone') || ' sent you a message.',
    NEW.sender_id
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_message_received ON public.messages;
CREATE TRIGGER on_message_received
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_message();

-- Trigger: Notify nutritionist when patient logs progress
CREATE OR REPLACE FUNCTION public.notify_progress_logged()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  nutritionist_id uuid;
  patient_name text;
BEGIN
  SELECT p.nutritionist_id INTO nutritionist_id 
  FROM public.patients p 
  WHERE p.patient_id = NEW.patient_id
  LIMIT 1;
  
  SELECT full_name INTO patient_name FROM public.profiles WHERE id = NEW.patient_id;
  
  IF nutritionist_id IS NOT NULL THEN
    PERFORM public.create_notification(
      nutritionist_id,
      'progress',
      'Progress Update',
      COALESCE(patient_name, 'A patient') || ' logged new progress.',
      NEW.patient_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_progress_logged ON public.progress_logs;
CREATE TRIGGER on_progress_logged
AFTER INSERT ON public.progress_logs
FOR EACH ROW
EXECUTE FUNCTION public.notify_progress_logged();