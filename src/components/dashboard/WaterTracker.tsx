import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Droplets, Plus, Minus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";

type WaterLog = {
  id: string;
  patient_id: string;
  log_date: string;
  glasses_count: number;
  goal_glasses: number;
};

type WaterTrackerProps = {
  userId: string;
};

const WaterTracker = ({ userId }: WaterTrackerProps) => {
  const { t } = useLanguage();
  const [waterLog, setWaterLog] = useState<WaterLog | null>(null);
  const [loading, setLoading] = useState(true);

  const todayStr = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    fetchWaterLog();
  }, [userId]);

  const fetchWaterLog = async () => {
    try {
      const { data, error } = await supabase
        .from("water_logs")
        .select("*")
        .eq("patient_id", userId)
        .eq("log_date", todayStr)
        .maybeSingle();

      if (error) throw error;
      setWaterLog(data);
    } catch (error) {
      console.error("Error fetching water log:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateWaterCount = async (increment: boolean) => {
    const currentCount = waterLog?.glasses_count || 0;
    const newCount = increment ? currentCount + 1 : Math.max(0, currentCount - 1);
    const goalGlasses = waterLog?.goal_glasses || 8;

    try {
      if (waterLog) {
        // Update existing log
        const { data, error } = await supabase
          .from("water_logs")
          .update({ glasses_count: newCount })
          .eq("id", waterLog.id)
          .select()
          .single();

        if (error) throw error;
        setWaterLog(data);
      } else {
        // Create new log
        const { data, error } = await supabase
          .from("water_logs")
          .insert({
            patient_id: userId,
            log_date: todayStr,
            glasses_count: newCount,
            goal_glasses: goalGlasses,
          })
          .select()
          .single();

        if (error) throw error;
        setWaterLog(data);
      }
    } catch (error) {
      console.error("Error updating water log:", error);
    }
  };

  const glassesCount = waterLog?.glasses_count || 0;
  const goalGlasses = waterLog?.goal_glasses || 8;
  const progressPercent = (glassesCount / goalGlasses) * 100;
  const isGoalReached = glassesCount >= goalGlasses;

  // Create array for visual glass representation
  const glassesArray = Array.from({ length: goalGlasses }, (_, i) => i < glassesCount);

  return (
    <Card className={isGoalReached ? "border-blue-500/50 bg-blue-500/5" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Droplets className={`h-5 w-5 ${isGoalReached ? "text-blue-500" : "text-primary"}`} />
              {t("patientDashboard.waterIntake")}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {t("patientDashboard.dailyGoal")}: {goalGlasses} {t("patientDashboard.glasses")}
            </CardDescription>
          </div>
          <div className="text-right">
            <span className={`text-2xl font-bold ${isGoalReached ? "text-blue-500" : ""}`}>
              {glassesCount}
            </span>
            <span className="text-sm text-muted-foreground">/{goalGlasses}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress 
          value={Math.min(progressPercent, 100)} 
          className={`h-3 ${isGoalReached ? "[&>div]:bg-blue-500" : ""}`}
        />

        {/* Visual glasses representation */}
        <div className="flex flex-wrap gap-2 justify-center py-2">
          {glassesArray.map((filled, index) => (
            <div
              key={index}
              className={`w-6 h-8 rounded-b-lg border-2 transition-all ${
                filled
                  ? "bg-blue-500/80 border-blue-500"
                  : "bg-muted/30 border-muted-foreground/20"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateWaterCount(false)}
            disabled={loading || glassesCount === 0}
            className="h-12 w-12 rounded-full"
          >
            <Minus className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            onClick={() => updateWaterCount(true)}
            disabled={loading}
            className={`h-14 w-14 rounded-full ${
              isGoalReached ? "bg-blue-500 hover:bg-blue-600" : ""
            }`}
          >
            <Plus className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateWaterCount(false)}
            disabled={loading || glassesCount === 0}
            className="h-12 w-12 rounded-full opacity-0 pointer-events-none"
          >
            <Minus className="h-5 w-5" />
          </Button>
        </div>

        {isGoalReached && (
          <p className="text-center text-sm text-blue-500 font-medium">
            🎉 {t("patientDashboard.goalReached")}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default WaterTracker;
