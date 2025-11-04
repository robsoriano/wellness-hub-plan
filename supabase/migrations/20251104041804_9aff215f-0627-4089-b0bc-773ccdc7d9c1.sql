-- Create table for meal template items
CREATE TABLE public.meal_template_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_template_id UUID NOT NULL REFERENCES public.meal_templates(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL,
  meal_name TEXT NOT NULL,
  description TEXT,
  time TEXT,
  calories INTEGER,
  protein NUMERIC,
  carbs NUMERIC,
  fats NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.meal_template_items ENABLE ROW LEVEL SECURITY;

-- Nutritionists can manage their template items
CREATE POLICY "Nutritionists can manage template items"
ON public.meal_template_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM meal_templates
    WHERE meal_templates.id = meal_template_items.meal_template_id
    AND meal_templates.nutritionist_id = auth.uid()
  )
);

-- Users can view template items
CREATE POLICY "Users can view template items"
ON public.meal_template_items
FOR SELECT
USING (true);

-- Add index for performance
CREATE INDEX idx_meal_template_items_template_id ON public.meal_template_items(meal_template_id);