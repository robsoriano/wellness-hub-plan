import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import PatientOverview from "@/components/dashboard/PatientOverview";
import MealPlans from "@/components/dashboard/MealPlans";
import ProgressTracking from "@/components/dashboard/ProgressTracking";
import MessageThread from "@/components/messaging/MessageThread";

type PatientData = {
  id: string;
  patient_id: string;
  nutritionist_id: string;
  age: number | null;
  height: number | null;
  weight: number | null;
  target_weight: number | null;
  body_fat_percentage: number | null;
  metabolic_age: number | null;
  bmi: number | null;
  dietary_restrictions: string | null;
  activity_level: string | null;
  notes: string | null;
  status: string;
  profiles: {
    full_name: string;
    email: string;
  };
};

const PatientDetail = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      setCurrentUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (profile) setUserName(profile.full_name);

      const { data, error } = await supabase
        .from("patients")
        .select(`
          *,
          profiles!patients_patient_id_fkey (
            full_name,
            email
          )
        `)
        .eq("id", patientId)
        .single();

      if (error) {
        console.error("Error fetching patient:", error);
      } else {
        setPatient(data);
      }
      setLoading(false);
    };

    fetchData();
  }, [patientId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav userName={userName} />
        <div className="container py-8">
          <p>Patient not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav userName={userName} />
      
      <div className="container py-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">{patient.profiles.full_name}</h1>
          <p className="text-muted-foreground">{patient.profiles.email}</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="meal-plans">Meal Plans</TabsTrigger>
            <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <PatientOverview patient={patient} onUpdate={(updatedPatient) => setPatient(updatedPatient)} />
          </TabsContent>

          <TabsContent value="meal-plans" className="mt-6">
            <MealPlans patientId={patient.patient_id} nutritionistId={patient.nutritionist_id} />
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            <ProgressTracking patientId={patient.patient_id} />
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            {currentUserId && (
              <MessageThread
                currentUserId={currentUserId}
                otherUserId={patient.patient_id}
                otherUserName={patient.profiles.full_name}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientDetail;
