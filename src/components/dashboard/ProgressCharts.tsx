import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type ProgressChartsProps = {
  patientId: string;
};

type ProgressData = {
  log_date: string;
  weight: number;
  muscle_percentage: number;
  body_fat_percentage: number;
  energy_level: number;
  mood: string;
};

const ProgressCharts = ({ patientId }: ProgressChartsProps) => {
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgressData = async () => {
      const { data, error } = await supabase
        .from("progress_logs")
        .select("*")
        .eq("patient_id", patientId)
        .order("log_date", { ascending: true })
        .limit(30);

      if (error) {
        console.error("Error fetching progress:", error);
      } else {
        setProgressData(data || []);
      }
      setLoading(false);
    };

    fetchProgressData();
  }, [patientId]);

  if (loading) {
    return <div>Loading charts...</div>;
  }

  const weightData = progressData.map((log) => ({
    date: new Date(log.log_date).toLocaleDateString(),
    weight: log.weight,
  }));

  const energyData = progressData.map((log) => ({
    date: new Date(log.log_date).toLocaleDateString(),
    energy: log.energy_level,
  }));

  const muscleData = progressData
    .filter((log) => log.muscle_percentage != null)
    .map((log) => ({
      date: new Date(log.log_date).toLocaleDateString(),
      muscle: log.muscle_percentage,
    }));

  const bodyFatData = progressData
    .filter((log) => log.body_fat_percentage != null)
    .map((log) => ({
      date: new Date(log.log_date).toLocaleDateString(),
      bodyFat: log.body_fat_percentage,
    }));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Weight Progress</CardTitle>
          <CardDescription>Track weight changes over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Energy Levels</CardTitle>
          <CardDescription>Daily energy tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={energyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="energy" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {muscleData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Muscle Percentage</CardTitle>
            <CardDescription>Track muscle mass changes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={muscleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="muscle" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Muscle %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {bodyFatData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Body Fat Percentage</CardTitle>
            <CardDescription>Track body fat changes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bodyFatData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="bodyFat" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Body Fat %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProgressCharts;