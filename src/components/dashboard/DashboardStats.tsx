import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, MessageSquare } from "lucide-react";

type DashboardStatsProps = {
  userId: string;
  totalPatients: number;
  activePatients: number;
};

const DashboardStats = ({ userId, totalPatients, activePatients }: DashboardStatsProps) => {
  const [todayAppointments, setTodayAppointments] = useState(0);
  const [upcomingAppointments, setUpcomingAppointments] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch today's appointments
    const { data: todayData } = await supabase
      .from("appointments")
      .select("id", { count: "exact" })
      .eq("nutritionist_id", userId)
      .gte("appointment_date", today.toISOString().split('T')[0])
      .lt("appointment_date", tomorrow.toISOString().split('T')[0]);

    setTodayAppointments(todayData?.length || 0);

    // Fetch upcoming appointments (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const { data: upcomingData } = await supabase
      .from("appointments")
      .select("id", { count: "exact" })
      .eq("nutritionist_id", userId)
      .gte("appointment_date", tomorrow.toISOString().split('T')[0])
      .lte("appointment_date", nextWeek.toISOString().split('T')[0]);

    setUpcomingAppointments(upcomingData?.length || 0);

    // Fetch unread messages
    const { data: messagesData } = await supabase
      .from("messages")
      .select("id", { count: "exact" })
      .eq("receiver_id", userId)
      .eq("read", false);

    setUnreadMessages(messagesData?.length || 0);
  };

  return (
    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPatients}</div>
          <p className="text-xs text-muted-foreground">
            Active: {activePatients}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Appointments</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todayAppointments}</div>
          <p className="text-xs text-muted-foreground">
            {upcomingAppointments} upcoming this week
          </p>
        </CardContent>
      </Card>

      <Card className="sm:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Messages</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{unreadMessages}</div>
          <p className="text-xs text-muted-foreground">Unread messages</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;