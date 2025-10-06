import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, LineChart } from "lucide-react";
import AddProgressLogDialog from "./AddProgressLogDialog";
import { format } from "date-fns";
import { Line, LineChart as RechartsLineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type ProgressLog = {
  id: string;
  log_date: string;
  weight: number | null;
  energy_level: number | null;
  mood: string | null;
  notes: string | null;
  created_at: string;
};

const ProgressTracking = ({ patientId }: { patientId: string }) => {
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProgressLogs = async () => {
    const { data, error } = await supabase
      .from("progress_logs")
      .select("*")
      .eq("patient_id", patientId)
      .order("log_date", { ascending: false });

    if (error) {
      console.error("Error fetching progress logs:", error);
    } else {
      setProgressLogs(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProgressLogs();
  }, [patientId]);

  const chartData = progressLogs
    .filter(log => log.weight !== null)
    .reverse()
    .map(log => ({
      date: format(new Date(log.log_date), "MMM dd"),
      weight: log.weight,
    }));

  return (
    <>
      <div className="space-y-6">
        {chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Weight Progress</CardTitle>
              <CardDescription>Track weight changes over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Progress Logs</CardTitle>
              <CardDescription>Track patient progress and measurements</CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Log
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading progress logs...</p>
            ) : progressLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <LineChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No progress logs yet. Add one to start tracking!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {progressLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{format(new Date(log.log_date), "MMMM dd, yyyy")}</span>
                          {log.weight && (
                            <span className="text-sm text-muted-foreground">Weight: {log.weight} kg</span>
                          )}
                        </div>
                        {log.energy_level && (
                          <p className="text-sm text-muted-foreground">Energy Level: {log.energy_level}/10</p>
                        )}
                        {log.mood && (
                          <p className="text-sm text-muted-foreground">Mood: {log.mood}</p>
                        )}
                        {log.notes && (
                          <p className="text-sm mt-2">{log.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AddProgressLogDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        patientId={patientId}
        onLogAdded={fetchProgressLogs}
      />
    </>
  );
};

export default ProgressTracking;
