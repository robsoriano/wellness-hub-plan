-- Table for tracking meal completion
CREATE TABLE public.meal_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_plan_item_id UUID NOT NULL REFERENCES public.meal_plan_items(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(patient_id, meal_plan_item_id, completed_date)
);

-- Enable RLS
ALTER TABLE public.meal_completions ENABLE ROW LEVEL SECURITY;

-- Patients can manage their own meal completions
CREATE POLICY "Patients can manage their meal completions"
ON public.meal_completions
FOR ALL
USING (auth.uid() = patient_id)
WITH CHECK (auth.uid() = patient_id);

-- Nutritionists can view their patients' meal completions
CREATE POLICY "Nutritionists can view patient meal completions"
ON public.meal_completions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.patients
    WHERE patients.patient_id = meal_completions.patient_id
    AND patients.nutritionist_id = auth.uid()
  )
);

-- Table for tracking water intake
CREATE TABLE public.water_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  glasses_count INTEGER NOT NULL DEFAULT 0,
  goal_glasses INTEGER NOT NULL DEFAULT 8,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(patient_id, log_date)
);

-- Enable RLS
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;

-- Patients can manage their own water logs
CREATE POLICY "Patients can manage their water logs"
ON public.water_logs
FOR ALL
USING (auth.uid() = patient_id)
WITH CHECK (auth.uid() = patient_id);

-- Nutritionists can view their patients' water logs
CREATE POLICY "Nutritionists can view patient water logs"
ON public.water_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.patients
    WHERE patients.patient_id = water_logs.patient_id
    AND patients.nutritionist_id = auth.uid()
  )
);

-- Trigger for updating updated_at on water_logs
CREATE TRIGGER update_water_logs_updated_at
BEFORE UPDATE ON public.water_logs
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();