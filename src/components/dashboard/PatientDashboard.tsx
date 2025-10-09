import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardNav from "./DashboardNav";
import MealPlanDetail from "./MealPlanDetail";
import AddProgressLogDialog from "./AddProgressLogDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, Apple, MessageSquare, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

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
      
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground">Track your nutrition journey</p>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {patientData?.weight ? `${patientData.weight} kg` : "--"}
              </div>
              <p className="text-xs text-muted-foreground">
                {patientData?.bmi ? `BMI: ${patientData.bmi}` : "No data"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{streak}</div>
              <p className="text-xs text-muted-foreground">Days logging</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
              <Apple className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mealPlans.length}</div>
              <p className="text-xs text-muted-foreground">Meal plans</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/profile")}
              >
                View Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Active Meal Plans</CardTitle>
              <CardDescription>Your current nutrition plans</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading meal plans...</p>
              ) : mealPlans.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Apple className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active meal plans yet.</p>
                  <p className="text-sm">Your nutritionist will create one for you soon!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mealPlans.map((plan) => (
                    <div key={plan.id} className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-1">{plan.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          {new Date(plan.start_date).toLocaleDateString()} - {new Date(plan.end_date).toLocaleDateString()}
                        </span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewMealPlan(plan.id)}
                        >
                          View Details
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
              <CardTitle>Recent Progress</CardTitle>
              <CardDescription>Your latest health updates</CardDescription>
            </CardHeader>
            <CardContent>
              {recentLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No progress logs yet.</p>
                  <Button 
                    className="mt-4" 
                    size="sm"
                    onClick={() => setProgressDialogOpen(true)}
                  >
                    Log Today's Progress
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button 
                    className="w-full mb-4" 
                    onClick={() => setProgressDialogOpen(true)}
                  >
                    Log Today's Progress
                  </Button>
                  {recentLogs.map((log) => (
                    <div key={log.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">
                          {new Date(log.log_date).toLocaleDateString()}
                        </span>
                        {log.weight && (
                          <span className="text-sm font-medium">
                            {log.weight} kg
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {log.energy_level && (
                          <p>Energy: {log.energy_level}/10</p>
                        )}
                        {log.mood && (
                          <p>Mood: {log.mood}</p>
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
