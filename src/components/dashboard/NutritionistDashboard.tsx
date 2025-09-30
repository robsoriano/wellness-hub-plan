import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "./DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, MessageSquare, PlusCircle } from "lucide-react";

interface NutritionistDashboardProps {
  userId: string;
}

const NutritionistDashboard = ({ userId }: NutritionistDashboardProps) => {
  const [profile, setProfile] = useState<any>(null);
  const [patientCount, setPatientCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      const { count } = await supabase
        .from("patients")
        .select("*", { count: "exact", head: true })
        .eq("nutritionist_id", userId);

      setProfile(profileData);
      setPatientCount(count || 0);
    };

    fetchData();
  }, [userId]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Nutritionist Dashboard" userName={profile?.full_name} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patientCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Action</CardTitle>
              <PlusCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button size="sm" className="w-full">New Plan</Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Patients</CardTitle>
              <CardDescription>Your most recent patient interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No patients yet. Add your first patient to get started!</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled consultations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No appointments scheduled.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NutritionistDashboard;
