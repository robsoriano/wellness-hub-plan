import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrendingDown, TrendingUp, Target } from "lucide-react";

type GoalProgressProps = {
  patientId: string;
};

type PatientData = {
  weight: number;
  target_weight: number;
  bmi: number;
};

const GoalProgress = ({ patientId }: GoalProgressProps) => {
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [latestWeight, setLatestWeight] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: patient } = await supabase
        .from("patients")
        .select("weight, target_weight, bmi")
        .eq("patient_id", patientId)
        .single();

      const { data: latestLog } = await supabase
        .from("progress_logs")
        .select("weight")
        .eq("patient_id", patientId)
        .order("log_date", { ascending: false })
        .limit(1)
        .single();

      if (patient) setPatientData(patient);
      if (latestLog) setLatestWeight(latestLog.weight);
    };

    fetchData();
  }, [patientId]);

  if (!patientData) {
    return <div>Loading goal progress...</div>;
  }

  const currentWeight = latestWeight || patientData.weight;
  const startWeight = patientData.weight;
  const targetWeight = patientData.target_weight;
  
  const totalChange = Math.abs(startWeight - targetWeight);
  const currentChange = Math.abs(startWeight - currentWeight);
  const progressPercentage = totalChange > 0 ? (currentChange / totalChange) * 100 : 0;
  
  const isGaining = targetWeight > startWeight;
  const remainingWeight = Math.abs(currentWeight - targetWeight);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Goal Progress
        </CardTitle>
        <CardDescription>Track your journey to your target weight</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Current: {currentWeight}kg</span>
            <span>Target: {targetWeight}kg</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <p className="text-sm text-muted-foreground text-center">
            {progressPercentage.toFixed(1)}% complete
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Starting Weight</p>
            <p className="text-2xl font-bold">{startWeight}kg</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className="text-2xl font-bold flex items-center gap-1">
              {remainingWeight.toFixed(1)}kg
              {isGaining ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-blue-500" />
              )}
            </p>
          </div>
        </div>

        {patientData.bmi && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">Current BMI</p>
            <p className="text-2xl font-bold">{patientData.bmi.toFixed(1)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalProgress;