import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardNav from "./DashboardNav";
import MealPlanDetail from "./MealPlanDetail";
import AddProgressLogDialog from "./AddProgressLogDialog";
import GoalProgress from "./GoalProgress";
import AppointmentCalendar from "./AppointmentCalendar";
import DailyMealChecklist from "./DailyMealChecklist";
import WaterTracker from "./WaterTracker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, TrendingUp, Apple, MessageSquare, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

type PatientDashboardProps = {
  profile: {
    full_name: string;
    email: string;
  };
  userId: string;
};

type MealPlan = {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
};

type ProgressLog = {
  id: string;
  log_date: string;
  weight: number | null;
  energy_level: number | null;
  mood: string | null;
  notes: string | null;
};

type PatientData = {
  id: string;
  age: number | null;
  height: number | null;
  weight: number | null;
  target_weight: number | null;
  bmi: number | null;
};

const PatientDashboard = ({ profile, userId }: PatientDashboardProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [selectedMealPlan, setSelectedMealPlan] = useState<string | null>(null);
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [recentLogs, setRecentLogs] = useState<ProgressLog[]>([]);

  const calculateStreak = (logs: ProgressLog[]) => {
    if (logs.length === 0) return 0;
    
    const sortedLogs = [...logs].sort((a, b) => 
      new Date(b.log_date).getTime() - new Date(a.log_date).getTime()
    );
    
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedLogs.length; i++) {
      const logDate = new Date(sortedLogs[i].log_date);
      logDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);
      
      if (logDate.getTime() === expectedDate.getTime()) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    return currentStreak;
  };

  const fetchData = async () => {
    try {
      // Fetch meal plans
      const { data: mealPlansData, error: mealPlansError } = await supabase
        .from("meal_plans")
        .select("*")
        .eq("patient_id", userId)
        .eq("is_active", true);

      if (mealPlansError) throw mealPlansError;
      setMealPlans(mealPlansData || []);

      // Fetch progress logs
      const { data: logsData, error: logsError } = await supabase
        .from("progress_logs")
        .select("*")
        .eq("patient_id", userId)
        .order("log_date", { ascending: false })
        .limit(30);

      if (logsError) throw logsError;
      setProgressLogs(logsData || []);
      setRecentLogs((logsData || []).slice(0, 5));
      setStreak(calculateStreak(logsData || []));

      // Fetch patient data
      const { data: patientDataResult, error: patientError } = await supabase
        .from("patients")
        .select("*")
        .eq("patient_id", userId)
        .single();

      if (patientError && patientError.code !== "PGRST116") {
        console.error("Error fetching patient data:", patientError);
      } else {
        setPatientData(patientDataResult);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handleViewMealPlan = (planId: string) => {
    setSelectedMealPlan(planId);
  };

  const handleBackToOverview = () => {
    setSelectedMealPlan(null);
  };

  const handleProgressLogged = () => {
    fetchData();
    toast({
      title: "Success",
      description: "Progress logged successfully",
    });
  };

  if (selectedMealPlan) {
    return (
      <MealPlanDetail
        mealPlanId={selectedMealPlan}
        onBack={handleBackToOverview}
        onUpdate={fetchData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav userName={profile.full_name} />
      
      <div className="container py-6 sm:py-8 px-4">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            {t('patientDashboard.title')}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">{t('patientDashboard.subtitle')}</p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <Card className="group border-2 hover:border-primary/50 transition-all duration-300 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                {t('patientDashboard.currentWeight')}
              </CardTitle>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </CardHeader>
            <CardContent className="relative p-4 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold tracking-tight">
                {patientData?.weight ? `${patientData.weight} kg` : "--"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {patientData?.bmi ? `${t('patientDashboard.bmi')}: ${patientData.bmi}` : t('patientDashboard.noData')}
              </p>
            </CardContent>
          </Card>

          <Card className="group border-2 hover:border-secondary/50 transition-all duration-300 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground group-hover:text-secondary transition-colors">
                {t('patientDashboard.currentStreak')}
              </CardTitle>
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-secondary" />
            </CardHeader>
            <CardContent className="relative p-4 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold tracking-tight">{streak}</div>
              <p className="text-xs text-muted-foreground mt-1">{t('patientDashboard.daysLogging')}</p>
            </CardContent>
          </Card>

          <Card className="group border-2 hover:border-accent/50 transition-all duration-300 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground group-hover:text-accent transition-colors">
                {t('patientDashboard.activePlans')}
              </CardTitle>
              <Apple className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
            </CardHeader>
            <CardContent className="relative p-4 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold tracking-tight">{mealPlans.length}</div>
              <p className="text-xs text-muted-foreground mt-1">{t('patientDashboard.mealPlans')}</p>
            </CardContent>
          </Card>

          <Card className="group border-2 hover:border-primary/50 transition-all duration-300 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                {t('patientDashboard.profile')}
              </CardTitle>
              <User className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </CardHeader>
            <CardContent className="relative p-4 sm:p-6 pt-0">
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full text-xs"
                onClick={() => navigate("/profile")}
              >
                {t('patientDashboard.viewProfile')}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">{t('patientDashboard.overview')}</TabsTrigger>
            <TabsTrigger value="progress" className="text-xs sm:text-sm">{t('patientDashboard.progress')}</TabsTrigger>
            <TabsTrigger value="appointments" className="text-xs sm:text-sm">{t('patientDashboard.appointments')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            {/* Daily Tracking Section */}
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <DailyMealChecklist 
                userId={userId} 
                mealPlanId={mealPlans.length > 0 ? mealPlans[0].id : null} 
              />
              <WaterTracker userId={userId} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">{t('patientDashboard.activeMealPlans')}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{t('patientDashboard.currentPlans')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-sm">Loading...</p>
                  ) : mealPlans.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Apple className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">{t('patientDashboard.noPlansYet')}</p>
                      <p className="text-xs mt-2">{t('patientDashboard.nutritionistWillCreate')}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {mealPlans.map((plan) => (
                        <div key={plan.id} className="p-4 border rounded-lg hover:border-primary/50 transition-all">
                          <h3 className="font-medium mb-1 text-sm sm:text-base">{plan.title}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-2">{plan.description}</p>
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(plan.start_date).toLocaleDateString()} - {new Date(plan.end_date).toLocaleDateString()}
                            </span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewMealPlan(plan.id)}
                              className="text-xs"
                            >
                              {t('patientDashboard.viewDetails')}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">{t('patientDashboard.recentProgress')}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{t('patientDashboard.latestUpdates')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentLogs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">{t('patientDashboard.noProgressYet')}</p>
                      <Button 
                        className="mt-4" 
                        size="sm"
                        onClick={() => setProgressDialogOpen(true)}
                      >
                        {t('patientDashboard.logTodayProgress')}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Button 
                        className="w-full mb-4" 
                        size="sm"
                        onClick={() => setProgressDialogOpen(true)}
                      >
                        {t('patientDashboard.logTodayProgress')}
                      </Button>
                      {recentLogs.map((log) => (
                        <div key={log.id} className="p-4 border rounded-lg hover:border-secondary/50 transition-all">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-sm">
                              {new Date(log.log_date).toLocaleDateString()}
                            </span>
                            {log.weight && (
                              <span className="text-sm font-medium">
                                {log.weight} kg
                              </span>
                            )}
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                            {log.energy_level && (
                              <p>{t('patientDashboard.energy')}: {log.energy_level}/10</p>
                            )}
                            {log.mood && (
                              <p>{t('patientDashboard.mood')}: {log.mood}</p>
                            )}
                            {log.notes && (
                              <p className="text-xs mt-2">{log.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="mt-0">
            <GoalProgress patientId={userId} />
          </TabsContent>

          <TabsContent value="appointments" className="mt-0">
            <AppointmentCalendar userRole="patient" userId={userId} />
          </TabsContent>
        </Tabs>
      </div>

      <AddProgressLogDialog
        open={progressDialogOpen}
        onOpenChange={setProgressDialogOpen}
        patientId={userId}
        onLogAdded={handleProgressLogged}
      />
    </div>
  );
};

export default PatientDashboard;
