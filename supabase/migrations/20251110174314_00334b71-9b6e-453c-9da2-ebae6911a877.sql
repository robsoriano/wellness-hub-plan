-- Add policy to allow nutritionists to insert progress logs for their patients
CREATE POLICY "Nutritionists can insert patient progress"
ON progress_logs
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM patients
    WHERE patients.patient_id = progress_logs.patient_id
    AND patients.nutritionist_id = auth.uid()
  )
);