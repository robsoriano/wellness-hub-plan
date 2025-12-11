import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckCircle2, Droplets, Calendar } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subDays } from "date-fns";

type WeeklySummaryProps = {
  userId: string;
};

type DaySummary = {
  date: Date;
  mealsCompleted: number;
  totalMeals: number;
  waterGlasses: number;
  waterGoal: number;
};

const WeeklySummary = ({ userId }: WeeklySummaryProps) => {
  const { t } = useLanguage();
  const [weekData, setWeekData] = useState<DaySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeekData = async () => {
      try {
        const today = new Date();
        const weekStart = startOfWeek(today, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
        const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

        // Fetch meal completions for the week
        const { data: completions } = await supabase
          .from("meal_completions")
          .select("completed_date, meal_plan_item_id")
          .eq("patient_id", userId)
          .gte("completed_date", format(weekStart, "yyyy-MM-dd"))
          .lte("completed_date", format(weekEnd, "yyyy-MM-dd"));

        // Fetch water logs for the week
        const { data: waterLogs } = await supabase
          .from("water_logs")
          .select("log_date, glasses_count, goal_glasses")
          .eq("patient_id", userId)
          .gte("log_date", format(weekStart, "yyyy-MM-dd"))
          .lte("log_date", format(weekEnd, "yyyy-MM-dd"));

        // Fetch active meal plan items count
        const { data: mealPlans } = await supabase
          .from("meal_plans")
          .select("id")
          .eq("patient_id", userId)
          .eq("is_active", true);

        let totalMealsPerDay = 0;
        if (mealPlans && mealPlans.length > 0) {
          const { count } = await supabase
            .from("meal_plan_items")
            .select("*", { count: "exact", head: true })
            .eq("meal_plan_id", mealPlans[0].id)
            .eq("day_of_week", 1); // Get count for one day as reference
          totalMealsPerDay = count || 5; // Default to 5 meals if no data
        }

        const summaryData: DaySummary[] = daysInWeek.map((date) => {
          const dateStr = format(date, "yyyy-MM-dd");
          const dayCompletions = completions?.filter(
            (c) => c.completed_date === dateStr
          ) || [];
          const dayWater = waterLogs?.find((w) => w.log_date === dateStr);

          return {
            date,
            mealsCompleted: dayCompletions.length,
            totalMeals: totalMealsPerDay || 5,
            waterGlasses: dayWater?.glasses_count || 0,
            waterGoal: dayWater?.goal_glasses || 8,
          };
        });

        setWeekData(summaryData);
      } catch (error) {
        console.error("Error fetching weekly summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeekData();
  }, [userId]);

  const totalMealsCompleted = weekData.reduce((sum, d) => sum + d.mealsCompleted, 0);
  const totalMealsTarget = weekData.reduce((sum, d) => sum + d.totalMeals, 0);
  const totalWaterConsumed = weekData.reduce((sum, d) => sum + d.waterGlasses, 0);
  const totalWaterGoal = weekData.reduce((sum, d) => sum + d.waterGoal, 0);

  const mealPercentage = totalMealsTarget > 0 ? (totalMealsCompleted / totalMealsTarget) * 100 : 0;
  const waterPercentage = totalWaterGoal > 0 ? (totalWaterConsumed / totalWaterGoal) * 100 : 0;

  const dayNames = ["M", "T", "W", "T", "F", "S", "S"];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t('weeklySummary.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('weeklySummary.loading')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {t('weeklySummary.title')}
        </CardTitle>
        <CardDescription>{t('weeklySummary.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Weekly Overview Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {t('weeklySummary.mealsCompleted')}
            </div>
            <p className="text-2xl font-bold">
              {totalMealsCompleted}<span className="text-muted-foreground text-lg">/{totalMealsTarget}</span>
            </p>
            <Progress value={mealPercentage} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Droplets className="h-4 w-4 text-blue-500" />
              {t('weeklySummary.waterIntake')}
            </div>
            <p className="text-2xl font-bold">
              {totalWaterConsumed}<span className="text-muted-foreground text-lg">/{totalWaterGoal}</span>
            </p>
            <Progress value={waterPercentage} className="h-2" />
          </div>
        </div>

        {/* Daily Breakdown */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{t('weeklySummary.dailyBreakdown')}</p>
          <div className="grid grid-cols-7 gap-1">
            {weekData.map((day, index) => {
              const isToday = format(day.date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
              const mealScore = day.totalMeals > 0 ? day.mealsCompleted / day.totalMeals : 0;
              const waterScore = day.waterGoal > 0 ? day.waterGlasses / day.waterGoal : 0;
              const avgScore = (mealScore + waterScore) / 2;
              
              let bgColor = "bg-muted";
              if (avgScore >= 0.8) bgColor = "bg-primary";
              else if (avgScore >= 0.5) bgColor = "bg-primary/60";
              else if (avgScore > 0) bgColor = "bg-primary/30";

              return (
                <div key={index} className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">{dayNames[index]}</span>
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${bgColor} ${
                      isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                    }`}
                  >
                    <span className={avgScore > 0 ? "text-primary-foreground" : "text-muted-foreground"}>
                      {format(day.date, "d")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center pt-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-muted" />
              <span>{t('weeklySummary.noActivity')}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-primary/30" />
              <span>{t('weeklySummary.some')}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-primary" />
              <span>{t('weeklySummary.complete')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklySummary;
