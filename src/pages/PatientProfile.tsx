import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Edit, Save, X, TrendingUp, Calendar } from "lucide-react";
import { toast } from "sonner";

const profileSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100),
  phone: z.string().trim().max(20).optional(),
  age: z.coerce.number().positive().int().max(150).optional(),
  height: z.coerce.number().positive().max(300).optional(),
  weight: z.coerce.number().positive().max(500).optional(),
  target_weight: z.coerce.number().positive().max(500).optional(),
  body_fat_percentage: z.coerce.number().min(0).max(100).optional(),
  metabolic_age: z.coerce.number().positive().int().max(150).optional(),
  activity_level: z.string().optional(),
  dietary_restrictions: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

type ProgressLog = {
  id: string;
  log_date: string;
  weight: number | null;
};

const PatientProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [bmi, setBmi] = useState<number | null>(null);
  const [recentProgress, setRecentProgress] = useState<ProgressLog[]>([]);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      age: undefined,
      height: undefined,
      weight: undefined,
      target_weight: undefined,
      body_fat_percentage: undefined,
      metabolic_age: undefined,
      activity_level: "",
      dietary_restrictions: "",
      notes: "",
    },
  });

  const fetchProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      setUserId(user.id);

      // Fetch profile data
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      setEmail(profile.email);
      setCreatedAt(profile.created_at);
      
      // Fetch patient data
      const { data: patient, error: patientError } = await supabase
        .from("patients")
        .select("*")
        .eq("patient_id", user.id)
        .maybeSingle();

      if (patientError && patientError.code !== "PGRST116") {
        console.error("Error fetching patient data:", patientError);
      }

      // Fetch recent progress
      const { data: progress } = await supabase
        .from("progress_logs")
        .select("id, log_date, weight")
        .eq("patient_id", user.id)
        .order("log_date", { ascending: false })
        .limit(5);

      setRecentProgress(progress || []);

      // Calculate BMI
      if (patient?.weight && patient?.height) {
        const heightInMeters = patient.height / 100;
        const calculatedBmi = patient.weight / (heightInMeters * heightInMeters);
        setBmi(Math.round(calculatedBmi * 10) / 10);
      }

      // Set form values
      form.reset({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        age: patient?.age || undefined,
        height: patient?.height || undefined,
        weight: patient?.weight || undefined,
        target_weight: patient?.target_weight || undefined,
        body_fat_percentage: patient?.body_fat_percentage || undefined,
        metabolic_age: patient?.metabolic_age || undefined,
        activity_level: patient?.activity_level || "",
        dietary_restrictions: patient?.dietary_restrictions || "",
        notes: patient?.notes || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const onSubmit = async (data: ProfileFormData) => {
    if (!userId) return;

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          phone: data.phone || null,
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      // Update or create patient record
      const { data: existingPatient } = await supabase
        .from("patients")
        .select("id")
        .eq("patient_id", userId)
        .maybeSingle();

      const patientData = {
        age: data.age || null,
        height: data.height || null,
        weight: data.weight || null,
        target_weight: data.target_weight || null,
        body_fat_percentage: data.body_fat_percentage || null,
        metabolic_age: data.metabolic_age || null,
        activity_level: data.activity_level || null,
        dietary_restrictions: data.dietary_restrictions || null,
        notes: data.notes || null,
      };

      if (existingPatient) {
        const { error: patientError } = await supabase
          .from("patients")
          .update(patientData)
          .eq("patient_id", userId);

        if (patientError) throw patientError;
      }

      // Calculate and update BMI
      if (data.weight && data.height) {
        const heightInMeters = data.height / 100;
        const calculatedBmi = data.weight / (heightInMeters * heightInMeters);
        setBmi(Math.round(calculatedBmi * 10) / 10);

        if (existingPatient) {
          await supabase
            .from("patients")
            .update({ bmi: calculatedBmi })
            .eq("patient_id", userId);
        }
      }

      toast.success("Profile updated successfully");
      setIsEditing(false);
      fetchProfileData();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav userName="Loading..." />
        <div className="container py-8">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav userName={form.watch("full_name")} />
      
      <div className="container py-8 max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">My Profile</h1>
              <p className="text-muted-foreground">Manage your personal information and health metrics</p>
            </div>
          </div>
          
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your basic account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={email} disabled />
                  <p className="text-xs text-muted-foreground">
                    Contact support to change your email address
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} placeholder="+1234567890" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <Label className="text-sm text-muted-foreground">Account Created</Label>
                    <p className="text-sm">{new Date(createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Role</Label>
                    <p className="text-sm">Patient</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Health Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Health Metrics</CardTitle>
                <CardDescription>Track your physical measurements and goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} disabled={!isEditing} placeholder="25" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} disabled={!isEditing} placeholder="170" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Weight (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} disabled={!isEditing} placeholder="70" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="target_weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Weight (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} disabled={!isEditing} placeholder="65" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="body_fat_percentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Body Fat (%)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} disabled={!isEditing} placeholder="20" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metabolic_age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Metabolic Age</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} disabled={!isEditing} placeholder="25" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {bmi && (
                  <div className="p-4 bg-muted rounded-lg">
                    <Label className="text-sm text-muted-foreground">BMI (Calculated)</Label>
                    <p className="text-2xl font-bold">{bmi}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on current weight and height
                    </p>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="activity_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity Level</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select activity level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary</SelectItem>
                          <SelectItem value="lightly_active">Lightly Active</SelectItem>
                          <SelectItem value="moderately_active">Moderately Active</SelectItem>
                          <SelectItem value="very_active">Very Active</SelectItem>
                          <SelectItem value="extremely_active">Extremely Active</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dietary_restrictions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dietary Restrictions</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          disabled={!isEditing} 
                          placeholder="E.g., vegetarian, lactose intolerant, nut allergy..."
                          className="min-h-[80px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          disabled={!isEditing} 
                          placeholder="Any additional information for your nutritionist..."
                          className="min-h-[80px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Progress History */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Progress</CardTitle>
                <CardDescription>Your latest weight tracking entries</CardDescription>
              </CardHeader>
              <CardContent>
                {recentProgress.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No progress logs yet</p>
                    <p className="text-sm">Start logging your progress from the dashboard</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentProgress.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {new Date(log.log_date).toLocaleDateString()}
                          </span>
                        </div>
                        {log.weight && (
                          <span className="text-sm font-semibold">
                            {log.weight} kg
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {isEditing && (
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    fetchProfileData();
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
};

export default PatientProfile;
