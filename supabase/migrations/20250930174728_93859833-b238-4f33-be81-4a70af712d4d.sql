-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('nutritionist', 'patient');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create patients table (links nutritionists to patients)
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(nutritionist_id, patient_id)
);

-- Create meal_plans table
CREATE TABLE public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nutritionist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create meal_plan_items table
CREATE TABLE public.meal_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  meal_type TEXT NOT NULL,
  meal_name TEXT NOT NULL,
  description TEXT,
  calories INTEGER,
  protein DECIMAL,
  carbs DECIMAL,
  fats DECIMAL,
  time TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create progress_logs table
CREATE TABLE public.progress_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  weight DECIMAL,
  notes TEXT,
  mood TEXT,
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  log_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for patients
CREATE POLICY "Nutritionists can view their patients"
  ON public.patients FOR SELECT
  USING (auth.uid() = nutritionist_id OR auth.uid() = patient_id);

CREATE POLICY "Nutritionists can manage their patients"
  ON public.patients FOR ALL
  USING (auth.uid() = nutritionist_id);

-- RLS Policies for meal_plans
CREATE POLICY "Users can view their meal plans"
  ON public.meal_plans FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() = nutritionist_id);

CREATE POLICY "Nutritionists can manage meal plans"
  ON public.meal_plans FOR ALL
  USING (auth.uid() = nutritionist_id);

-- RLS Policies for meal_plan_items
CREATE POLICY "Users can view meal plan items"
  ON public.meal_plan_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans
      WHERE meal_plans.id = meal_plan_items.meal_plan_id
      AND (meal_plans.patient_id = auth.uid() OR meal_plans.nutritionist_id = auth.uid())
    )
  );

CREATE POLICY "Nutritionists can manage meal plan items"
  ON public.meal_plan_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.meal_plans
      WHERE meal_plans.id = meal_plan_items.meal_plan_id
      AND meal_plans.nutritionist_id = auth.uid()
    )
  );

-- RLS Policies for progress_logs
CREATE POLICY "Patients can view own progress"
  ON public.progress_logs FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can insert own progress"
  ON public.progress_logs FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Nutritionists can view patient progress"
  ON public.progress_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.patient_id = progress_logs.patient_id
      AND patients.nutritionist_id = auth.uid()
    )
  );

-- RLS Policies for messages
CREATE POLICY "Users can view their messages"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update received messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER meal_plans_updated_at
  BEFORE UPDATE ON public.meal_plans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();