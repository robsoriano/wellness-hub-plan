import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "./DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, TrendingUp, Apple, Activity } from "lucide-react";

interface PatientDashboardProps {
  userId: string;
}

const PatientDashboard = ({ userId }: PatientDashboardProps) => {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      setProfile(data);
    };

    fetchProfile();
  }, [userId]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="My Dashboard" userName={profile?.full_name} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {profile?.full_name}!</h2>
          <p className="text-muted-foreground">Here's your nutrition journey overview</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 days</div>
              <p className="text-xs text-muted-foreground">Keep it up!</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meals Logged</CardTitle>
              <Apple className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">No data yet</p>
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
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Today's Meal Plan</CardTitle>
              <CardDescription>Your personalized nutrition plan for today</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No meal plan assigned yet. Contact your nutritionist to get started!</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Tips</CardTitle>
              <CardDescription>Personalized nutrition tips for you</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="mr-2">💧</span>
                  <span>Stay hydrated - aim for 8 glasses of water daily</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🥗</span>
                  <span>Include vegetables in every meal</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🍎</span>
                  <span>Choose whole fruits over fruit juice</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
