import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardNav from "./DashboardNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, Apple, MessageSquare } from "lucide-react";

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

const PatientDashboard = ({ profile, userId }: PatientDashboardProps) => {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMealPlans = async () => {
      const { data, error } = await supabase
        .from("meal_plans")
        .select("*")
        .eq("patient_id", userId)
        .eq("is_active", true);

      if (error) {
        console.error("Error fetching meal plans:", error);
      } else {
        setMealPlans(data || []);
      }
      setLoading(false);
    };

    fetchMealPlans();
  }, [userId]);

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
              <CardTitle className="text-sm font-medium">Today's Meals</CardTitle>
              <Apple className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3/3</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Check-in</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">Not scheduled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Unread</p>
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
                        <Button size="sm" variant="outline">View Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progress Log</CardTitle>
              <CardDescription>Track your daily progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No progress logs yet.</p>
                <Button className="mt-4" size="sm">Log Today's Progress</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
