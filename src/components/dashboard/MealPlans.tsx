import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Eye } from "lucide-react";
import CreateMealPlanDialog from "./CreateMealPlanDialog";
import MealPlanDetail from "./MealPlanDetail";
import { format } from "date-fns";

type MealPlan = {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
};

const MealPlans = ({ patientId, nutritionistId }: { patientId: string; nutritionistId: string }) => {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMealPlans = async () => {
    const { data, error } = await supabase
      .from("meal_plans")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching meal plans:", error);
    } else {
      setMealPlans(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMealPlans();
  }, [patientId]);

  if (selectedPlan) {
    return (
      <MealPlanDetail
        mealPlanId={selectedPlan}
        onBack={() => setSelectedPlan(null)}
        onUpdate={fetchMealPlans}
      />
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Meal Plans</CardTitle>
            <CardDescription>Create and manage meal plans for this patient</CardDescription>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Meal Plan
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading meal plans...</p>
          ) : mealPlans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No meal plans yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {mealPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{plan.title}</h3>
                      {plan.is_active && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Active</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(plan.start_date), "MMM dd, yyyy")} - {format(new Date(plan.end_date), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateMealPlanDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        patientId={patientId}
        nutritionistId={nutritionistId}
        onMealPlanCreated={fetchMealPlans}
      />
    </>
  );
};

export default MealPlans;
