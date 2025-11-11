import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Activity, Ruler, Weight, Target, Dumbbell } from "lucide-react";

type PatientData = {
  id: string;
  patient_id: string;
  nutritionist_id: string;
  age: number | null;
  height: number | null;
  weight: number | null;
  target_weight: number | null;
  body_fat_percentage: number | null;
  muscle_percentage: number | null;
  metabolic_age: number | null;
  bmi: number | null;
  dietary_restrictions: string | null;
  allergies: string | null;
  pathologies: string | null;
  activity_level: string | null;
  notes: string | null;
  status: string;
  profiles: {
    full_name: string;
    email: string;
  };
};

const PatientOverview = ({ patient, onUpdate }: { patient: PatientData; onUpdate: (patient: PatientData) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [formData, setFormData] = useState({
    age: patient.age || "",
    height: patient.height || "",
    weight: patient.weight || "",
    target_weight: patient.target_weight || "",
    body_fat_percentage: patient.body_fat_percentage || "",
    muscle_percentage: patient.muscle_percentage || "",
    metabolic_age: patient.metabolic_age || "",
    dietary_restrictions: patient.dietary_restrictions || "",
    allergies: patient.allergies || "",
    pathologies: patient.pathologies || "",
    activity_level: patient.activity_level || "",
    notes: patient.notes || "",
  });

  const calculateBMI = (weight: number, height: number) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const convertToKg = (value: number, unit: "kg" | "lbs") => {
    if (unit === "lbs") {
      return value * 0.453592;
    }
    return value;
  };

  const convertFromKg = (value: number, unit: "kg" | "lbs") => {
    if (unit === "lbs") {
      return value / 0.453592;
    }
    return value;
  };

  const getDisplayWeight = (kgValue: string | number) => {
    if (!kgValue) return "";
    const numValue = typeof kgValue === "string" ? parseFloat(kgValue) : kgValue;
    return weightUnit === "lbs" ? convertFromKg(numValue, "lbs").toFixed(1) : numValue.toFixed(1);
  };

  const handleSave = async () => {
    const weightInKg = formData.weight ? convertToKg(Number(formData.weight), weightUnit) : null;
    const targetWeightInKg = formData.target_weight ? convertToKg(Number(formData.target_weight), weightUnit) : null;
    const height = formData.height ? Number(formData.height) : null;
    const bmi = weightInKg && height ? Number(calculateBMI(weightInKg, height)) : null;

    const { data, error } = await supabase
      .from("patients")
      .update({
        age: formData.age ? Number(formData.age) : null,
        height: height,
        weight: weightInKg,
        target_weight: targetWeightInKg,
        body_fat_percentage: formData.body_fat_percentage ? Number(formData.body_fat_percentage) : null,
        muscle_percentage: formData.muscle_percentage ? Number(formData.muscle_percentage) : null,
        metabolic_age: formData.metabolic_age ? Number(formData.metabolic_age) : null,
        bmi: bmi,
        dietary_restrictions: formData.dietary_restrictions || null,
        allergies: formData.allergies || null,
        pathologies: formData.pathologies || null,
        activity_level: formData.activity_level || null,
        notes: formData.notes || null,
      })
      .eq("id", patient.id)
      .select(`
        *,
        profiles!patients_patient_id_fkey (
          full_name,
          email
        )
      `)
      .single();

    if (error) {
      toast.error("Failed to update patient");
      console.error(error);
    } else {
      toast.success("Patient updated successfully");
      onUpdate(data);
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Patient Information</CardTitle>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing && (
            <div className="flex gap-2 mb-4">
              <Button
                type="button"
                variant={weightUnit === "kg" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (weightUnit === "lbs") {
                    setWeightUnit("kg");
                    if (formData.weight) {
                      setFormData({
                        ...formData,
                        weight: convertToKg(Number(formData.weight), "lbs").toFixed(1),
                        target_weight: formData.target_weight
                          ? convertToKg(Number(formData.target_weight), "lbs").toFixed(1)
                          : "",
                      });
                    }
                  }
                }}
              >
                KG
              </Button>
              <Button
                type="button"
                variant={weightUnit === "lbs" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (weightUnit === "kg") {
                    setWeightUnit("lbs");
                    if (formData.weight) {
                      setFormData({
                        ...formData,
                        weight: convertFromKg(Number(formData.weight), "lbs").toFixed(1),
                        target_weight: formData.target_weight
                          ? convertFromKg(Number(formData.target_weight), "lbs").toFixed(1)
                          : "",
                      });
                    }
                  }
                }}
              >
                LBS
              </Button>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight ({weightUnit})</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_weight">Target Weight ({weightUnit})</Label>
              <Input
                id="target_weight"
                type="number"
                step="0.1"
                value={formData.target_weight}
                onChange={(e) => setFormData({ ...formData, target_weight: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body_fat">Body Fat Percentage (%)</Label>
              <Input
                id="body_fat"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.body_fat_percentage}
                onChange={(e) => setFormData({ ...formData, body_fat_percentage: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="muscle_percentage">Muscle Percentage (%)</Label>
              <Input
                id="muscle_percentage"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.muscle_percentage}
                onChange={(e) => setFormData({ ...formData, muscle_percentage: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metabolic_age">Metabolic Age</Label>
              <Input
                id="metabolic_age"
                type="number"
                value={formData.metabolic_age}
                onChange={(e) => setFormData({ ...formData, metabolic_age: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity_level">Activity Level</Label>
              <Select
                value={formData.activity_level}
                onValueChange={(value) => setFormData({ ...formData, activity_level: value })}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary</SelectItem>
                  <SelectItem value="lightly_active">Lightly Active</SelectItem>
                  <SelectItem value="moderately_active">Moderately Active</SelectItem>
                  <SelectItem value="very_active">Very Active</SelectItem>
                  <SelectItem value="extremely_active">Extremely Active</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="dietary_restrictions">Dietary Restrictions</Label>
              <Textarea
                id="dietary_restrictions"
                value={formData.dietary_restrictions}
                onChange={(e) => setFormData({ ...formData, dietary_restrictions: e.target.value })}
                disabled={!isEditing}
                rows={2}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                disabled={!isEditing}
                rows={2}
                placeholder="List any food allergies or intolerances"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="pathologies">Pathologies</Label>
              <Textarea
                id="pathologies"
                value={formData.pathologies}
                onChange={(e) => setFormData({ ...formData, pathologies: e.target.value })}
                disabled={!isEditing}
                rows={2}
                placeholder="List any medical conditions or pathologies"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                disabled={!isEditing}
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BMI</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patient.bmi || (patient.weight && patient.height ? calculateBMI(patient.weight, patient.height) : "N/A")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Height</CardTitle>
            <Ruler className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patient.height || "N/A"}</div>
            <p className="text-xs text-muted-foreground">cm</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
            <Weight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patient.weight ? patient.weight.toFixed(1) : "N/A"}</div>
            <p className="text-xs text-muted-foreground">kg</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Weight</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patient.target_weight ? patient.target_weight.toFixed(1) : "N/A"}</div>
            <p className="text-xs text-muted-foreground">kg</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Body Fat</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patient.body_fat_percentage ? `${patient.body_fat_percentage}%` : "N/A"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Muscle</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patient.muscle_percentage ? `${patient.muscle_percentage}%` : "N/A"}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientOverview;
