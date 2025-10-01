import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { Loader2 } from "lucide-react";

const addPatientSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  age: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  target_weight: z.string().optional(),
  body_fat_percentage: z.string().optional(),
  metabolic_age: z.string().optional(),
  dietary_restrictions: z.string().trim().max(500, { message: "Dietary restrictions must be less than 500 characters" }).optional(),
  activity_level: z.string().optional(),
  notes: z.string().trim().max(500, { message: "Notes must be less than 500 characters" }).optional(),
});

type AddPatientDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nutritionistId: string;
  onPatientAdded: () => void;
};

const AddPatientDialog = ({ open, onOpenChange, nutritionistId, onPatientAdded }: AddPatientDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    age: "",
    height: "",
    weight: "",
    target_weight: "",
    body_fat_percentage: "",
    metabolic_age: "",
    dietary_restrictions: "",
    activity_level: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const calculateBMI = (weight: number, height: number): number => {
    // BMI = weight (kg) / (height (m))^2
    const heightInMeters = height / 100;
    return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const validation = addPatientSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as string] = error.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      // Look up user by email
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("email", formData.email.trim())
        .single();

      if (profileError || !profileData) {
        toast({
          title: "Patient not found",
          description: "No patient found with this email address. They need to sign up first.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Check if user is a patient
      if (profileData.role !== "patient") {
        toast({
          title: "Invalid user",
          description: "This user is not registered as a patient.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Check if patient is already added
      const { data: existingPatient } = await supabase
        .from("patients")
        .select("id")
        .eq("patient_id", profileData.id)
        .eq("nutritionist_id", nutritionistId)
        .single();

      if (existingPatient) {
        toast({
          title: "Patient already exists",
          description: "This patient is already in your list.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Calculate BMI if both height and weight are provided
      let bmi = null;
      const weight = formData.weight ? parseFloat(formData.weight) : null;
      const height = formData.height ? parseFloat(formData.height) : null;
      if (weight && height && height > 0) {
        bmi = calculateBMI(weight, height);
      }

      // Create patient record
      const { error: insertError } = await supabase.from("patients").insert({
        patient_id: profileData.id,
        nutritionist_id: nutritionistId,
        status: "active",
        age: formData.age ? parseInt(formData.age) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        target_weight: formData.target_weight ? parseFloat(formData.target_weight) : null,
        body_fat_percentage: formData.body_fat_percentage ? parseFloat(formData.body_fat_percentage) : null,
        metabolic_age: formData.metabolic_age ? parseInt(formData.metabolic_age) : null,
        bmi,
        dietary_restrictions: formData.dietary_restrictions || null,
        activity_level: formData.activity_level || null,
        notes: formData.notes || null,
      });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Patient added successfully!",
      });

      // Reset form
      setFormData({
        email: "",
        age: "",
        height: "",
        weight: "",
        target_weight: "",
        body_fat_percentage: "",
        metabolic_age: "",
        dietary_restrictions: "",
        activity_level: "",
        notes: "",
      });

      onPatientAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding patient:", error);
      toast({
        title: "Error",
        description: "Failed to add patient. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
          <DialogDescription>
            Enter the patient's email and optional health information to add them to your patient list.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              Patient Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="patient@example.com"
              required
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min="0"
                max="150"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="e.g., 30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                min="0"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                placeholder="e.g., 170"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="e.g., 70"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_weight">Target Weight (kg)</Label>
              <Input
                id="target_weight"
                type="number"
                step="0.1"
                min="0"
                value={formData.target_weight}
                onChange={(e) => setFormData({ ...formData, target_weight: e.target.value })}
                placeholder="e.g., 65"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="body_fat_percentage">Body Fat %</Label>
              <Input
                id="body_fat_percentage"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.body_fat_percentage}
                onChange={(e) => setFormData({ ...formData, body_fat_percentage: e.target.value })}
                placeholder="e.g., 22.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metabolic_age">Metabolic Age</Label>
              <Input
                id="metabolic_age"
                type="number"
                min="0"
                max="150"
                value={formData.metabolic_age}
                onChange={(e) => setFormData({ ...formData, metabolic_age: e.target.value })}
                placeholder="e.g., 28"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity_level">Activity Level</Label>
            <Select
              value={formData.activity_level}
              onValueChange={(value) => setFormData({ ...formData, activity_level: value })}
            >
              <SelectTrigger id="activity_level">
                <SelectValue placeholder="Select activity level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                <SelectItem value="lightly_active">Lightly Active (1-3 days/week)</SelectItem>
                <SelectItem value="moderately_active">Moderately Active (3-5 days/week)</SelectItem>
                <SelectItem value="very_active">Very Active (6-7 days/week)</SelectItem>
                <SelectItem value="extremely_active">Extremely Active (physical job or training twice/day)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dietary_restrictions">Dietary Restrictions / Allergies</Label>
            <Textarea
              id="dietary_restrictions"
              value={formData.dietary_restrictions}
              onChange={(e) => setFormData({ ...formData, dietary_restrictions: e.target.value })}
              placeholder="e.g., Lactose intolerant, vegetarian, nut allergy..."
              rows={2}
            />
            {errors.dietary_restrictions && (
              <p className="text-sm text-destructive">{errors.dietary_restrictions}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this patient..."
              rows={3}
            />
            {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Patient"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPatientDialog;
