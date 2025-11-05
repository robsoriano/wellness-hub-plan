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
      <Card className="group border-2 hover:border-primary/50 transition-all duration-300 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
          <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors">
            Total Patients
          </CardTitle>
          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-all">
            <Users className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-3xl font-bold tracking-tight">{totalPatients}</div>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            <span className="text-primary">{activePatients}</span> active
          </p>
        </CardContent>
      </Card>

      <Card className="group border-2 hover:border-secondary/50 transition-all duration-300 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
          <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-secondary transition-colors">
            Appointments
          </CardTitle>
          <div className="p-2 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-all">
            <Calendar className="h-4 w-4 text-secondary" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-3xl font-bold tracking-tight">{todayAppointments}</div>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            <span className="text-secondary">{upcomingAppointments}</span> upcoming this week
          </p>
        </CardContent>
      </Card>

      <Card className="group sm:col-span-2 lg:col-span-1 border-2 hover:border-accent/50 transition-all duration-300 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
          <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-accent transition-colors">
            Messages
          </CardTitle>
          <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-all">
            <MessageSquare className="h-4 w-4 text-accent" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-3xl font-bold tracking-tight">{unreadMessages}</div>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Unread messages</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;