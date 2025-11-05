import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
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
  const { t } = useLanguage();
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
      
      <div className="container py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t('dashboard.title')}
            </h1>
            <p className="text-muted-foreground text-lg">{t('dashboard.subtitle')}</p>
          </div>
          <Button 
            onClick={() => setAddPatientOpen(true)} 
            size="lg"
            className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all"
          >
            <Plus className="h-5 w-5 mr-2" />
            {t('dashboard.addPatient')}
          </Button>
        </div>

        <DashboardStats
          userId={userId}
          totalPatients={patients.length}
          activePatients={patients.filter(p => p.status === 'active').length}
        />

        <Tabs defaultValue="patients" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 p-1 bg-muted/50 h-auto">
            <TabsTrigger 
              value="patients" 
              className="text-xs sm:text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm py-2.5"
            >
              {t('tabs.patients')}
            </TabsTrigger>
            <TabsTrigger 
              value="recipes" 
              className="text-xs sm:text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm py-2.5"
            >
              {t('tabs.recipes')}
            </TabsTrigger>
            <TabsTrigger 
              value="templates" 
              className="text-xs sm:text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm py-2.5"
            >
              {t('tabs.templates')}
            </TabsTrigger>
            <TabsTrigger 
              value="appointments" 
              className="text-xs sm:text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm py-2.5"
            >
              {t('tabs.appointments')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patients">
            <Card className="border-2">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">{t('patients.title')}</CardTitle>
                <CardDescription className="text-base">{t('patients.subtitle')}</CardDescription>
              </CardHeader>
              <CardContent>
                {patients.length > 0 && (
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('patients.search')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                )}
                {loading ? (
                  <p>{t('common.loading')}</p>
                ) : filteredPatients.length === 0 && searchQuery ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('patients.noResults')} "{searchQuery}"</p>
                  </div>
                ) : patients.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('patients.empty')}</p>
                  </div>
                 ) : (
                  <div className="space-y-4">
                     {filteredPatients.map((patient) => (
                       <div
                         key={patient.id}
                         className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-2 rounded-lg hover:border-primary/50 hover:shadow-md transition-all duration-300 group"
                       >
                         <div className="min-w-0 space-y-1">
                           <p className="font-semibold text-lg truncate group-hover:text-primary transition-colors">{patient.profiles.full_name}</p>
                           <p className="text-sm text-muted-foreground truncate">{patient.profiles.email}</p>
                         </div>
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => navigate(`/patient/${patient.id}`)}
                           className="w-full sm:w-auto shrink-0 border-primary/20 hover:border-primary hover:bg-primary/5 font-medium"
                         >
                           {t('patients.viewDetails')}
                         </Button>
                       </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recipes">
            <RecipeLibrary />
          </TabsContent>

          <TabsContent value="templates">
            <MealTemplates />
          </TabsContent>

          <TabsContent value="appointments">
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
