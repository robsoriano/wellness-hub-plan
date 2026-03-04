
CREATE OR REPLACE FUNCTION public.lookup_patient_by_email(p_email text)
RETURNS TABLE(id uuid, role text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.role::text
  FROM public.profiles p
  WHERE p.email = p_email
    AND p.role = 'patient'
  LIMIT 1;
$$;
