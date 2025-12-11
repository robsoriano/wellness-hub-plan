import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Utensils, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";

type MealPlanItem = {
  id: string;
  meal_name: string;
  meal_type: string;
  time: string | null;
  calories: number | null;
  day_of_week: number;
};

type MealCompletion = {
  id: string;
  meal_plan_item_id: string;
  completed_date: string;
};

type DailyMealChecklistProps = {
  userId: string;
  mealPlanId: string | null;
};

const DailyMealChecklist = ({ userId, mealPlanId }: DailyMealChecklistProps) => {
  const { t } = useLanguage();
  const [meals, setMeals] = useState<MealPlanItem[]>([]);
  const [completions, setCompletions] = useState<MealCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const dayOfWeek = today.getDay();
  const todayStr = format(today, "yyyy-MM-dd");

  useEffect(() => {
    if (mealPlanId) {
      fetchMealsAndCompletions();
    } else {
      setLoading(false);
    }
  }, [mealPlanId, userId]);

  const fetchMealsAndCompletions = async () => {
    if (!mealPlanId) return;

    try {
      // Fetch today's meals from the meal plan
      const { data: mealsData, error: mealsError } = await supabase
        .from("meal_plan_items")
        .select("*")
        .eq("meal_plan_id", mealPlanId)
        .eq("day_of_week", dayOfWeek)
        .order("time", { ascending: true });

      if (mealsError) throw mealsError;
      setMeals(mealsData || []);

      // Fetch today's completions
      const { data: completionsData, error: completionsError } = await supabase
        .from("meal_completions")
        .select("*")
        .eq("patient_id", userId)
        .eq("completed_date", todayStr);

      if (completionsError) throw completionsError;
      setCompletions(completionsData || []);
    } catch (error) {
      console.error("Error fetching meals:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMealCompletion = async (mealItemId: string) => {
    const existingCompletion = completions.find(
      (c) => c.meal_plan_item_id === mealItemId
    );

    try {
      if (existingCompletion) {
        // Remove completion
        const { error } = await supabase
          .from("meal_completions")
          .delete()
          .eq("id", existingCompletion.id);

        if (error) throw error;
        setCompletions(completions.filter((c) => c.id !== existingCompletion.id));
      } else {
        // Add completion
        const { data, error } = await supabase
          .from("meal_completions")
          .insert({
            patient_id: userId,
            meal_plan_item_id: mealItemId,
            completed_date: todayStr,
          })
          .select()
          .single();

        if (error) throw error;
        setCompletions([...completions, data]);
      }
    } catch (error) {
      console.error("Error toggling meal completion:", error);
    }
  };

  const isCompleted = (mealItemId: string) => {
    return completions.some((c) => c.meal_plan_item_id === mealItemId);
  };

  const completedCount = completions.length;
  const totalMeals = meals.length;
  const progressPercent = totalMeals > 0 ? (completedCount / totalMeals) * 100 : 0;

  const getMealTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      breakfast: t("meal.breakfast"),
      lunch: t("meal.lunch"),
      dinner: t("meal.dinner"),
      snack: t("meal.snack"),
    };
    return labels[type] || type;
  };

  const getMealTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      breakfast: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      lunch: "bg-green-500/10 text-green-600 border-green-500/20",
      dinner: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      snack: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    };
    return colors[type] || "bg-muted text-muted-foreground";
  };

  if (!mealPlanId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            {t("patientDashboard.dailyMeals")}
          </CardTitle>
          <CardDescription>{t("patientDashboard.noActivePlan")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Utensils className="h-5 w-5 text-primary" />
              {t("patientDashboard.dailyMeals")}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {format(today, "EEEE, MMMM d")}
            </CardDescription>
          </div>
          {totalMeals > 0 && (
            <Badge variant="outline" className="text-xs">
              {completedCount}/{totalMeals}
            </Badge>
          )}
        </div>
        {totalMeals > 0 && (
          <Progress value={progressPercent} className="h-2 mt-3" />
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        ) : meals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t("patientDashboard.noMealsToday")}
          </p>
        ) : (
          <div className="space-y-3">
            {meals.map((meal) => {
              const completed = isCompleted(meal.id);
              return (
                <div
                  key={meal.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:border-primary/50 ${
                    completed ? "bg-primary/5 border-primary/30" : "bg-background"
                  }`}
                  onClick={() => toggleMealCompletion(meal.id)}
                >
                  <Checkbox
                    checked={completed}
                    onCheckedChange={() => toggleMealCompletion(meal.id)}
                    className="h-5 w-5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`font-medium text-sm ${
                          completed ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {meal.meal_name}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getMealTypeColor(meal.meal_type)}`}
                      >
                        {getMealTypeLabel(meal.meal_type)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {meal.time && <span>{meal.time}</span>}
                      {meal.calories && <span>• {meal.calories} {t("common.calories")}</span>}
                    </div>
                  </div>
                  {completed && (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyMealChecklist;
