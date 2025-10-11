import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardNav from "./DashboardNav";
import AddPatientDialog from "./AddPatientDialog";
import RecipeLibrary from "./RecipeLibrary";
import MealTemplates from "./MealTemplates";
import AppointmentCalendar from "./AppointmentCalendar";
import DashboardStats from "./DashboardStats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Calendar, MessageSquare, Plus, Search } from "lucide-react";

type NutritionistDashboardProps = {
  profile: {
    full_name: string;
    email: string;
  };
  userId: string;
};

type PatientData = {
  id: string;
  patient_id: string;
  status: string;
  profiles: {
    full_name: string;
    email: string;
  };
};

const NutritionistDashboard = ({ profile, userId }: NutritionistDashboardProps) => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [addPatientOpen, setAddPatientOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPatients = async () => {
    const { data, error } = await supabase
      .from("patients")
      .select(`
        id,
        patient_id,
        status,
        profiles!patients_patient_id_fkey (
          full_name,
          email
        )
      `)
      .eq("nutritionist_id", userId);

    if (error) {
      console.error("Error fetching patients:", error);
    } else {
      setPatients(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPatients();
  }, [userId]);

  const filteredPatients = patients.filter(patient => 
    patient.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.profiles.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav userName={profile.full_name} />
      
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Nutritionist Dashboard</h1>
            <p className="text-muted-foreground">Manage your patients and meal plans</p>
          </div>
          <Button onClick={() => setAddPatientOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
        </div>

        <DashboardStats
          userId={userId}
          totalPatients={patients.length}
          activePatients={patients.filter(p => p.status === 'active').length}
        />

        <Tabs defaultValue="patients" className="w-full mt-8">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="patients" className="text-xs sm:text-sm">Patients</TabsTrigger>
            <TabsTrigger value="recipes" className="text-xs sm:text-sm">Recipes</TabsTrigger>
            <TabsTrigger value="templates" className="text-xs sm:text-sm">Templates</TabsTrigger>
            <TabsTrigger value="appointments" className="text-xs sm:text-sm">Appointments</TabsTrigger>
          </TabsList>

          <TabsContent value="patients" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Patients</CardTitle>
                <CardDescription>View and manage your patient list</CardDescription>
              </CardHeader>
              <CardContent>
                {patients.length > 0 && (
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search patients by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                )}
                {loading ? (
                  <p>Loading patients...</p>
                ) : filteredPatients.length === 0 && searchQuery ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No patients found matching "{searchQuery}"</p>
                  </div>
                ) : patients.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No patients yet. Add your first patient to get started!</p>
                  </div>
                 ) : (
                  <div className="space-y-4">
                    {filteredPatients.map((patient) => (
                      <div
                        key={patient.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg"
                      >
                        <div className="min-w-0">
                          <p className="font-medium truncate">{patient.profiles.full_name}</p>
                          <p className="text-sm text-muted-foreground truncate">{patient.profiles.email}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/patient/${patient.id}`)}
                          className="w-full sm:w-auto shrink-0"
                        >
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recipes" className="mt-6">
            <RecipeLibrary />
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <MealTemplates />
          </TabsContent>

          <TabsContent value="appointments" className="mt-6">
            <AppointmentCalendar userRole="nutritionist" userId={userId} />
          </TabsContent>
        </Tabs>
      </div>

      <AddPatientDialog
        open={addPatientOpen}
        onOpenChange={setAddPatientOpen}
        nutritionistId={userId}
        onPatientAdded={fetchPatients}
      />
    </div>
  );
};

export default NutritionistDashboard;
