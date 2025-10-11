import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Trash2, Edit, Copy } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type MealPlan = {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
};

type MealPlanItem = {
  id: string;
  meal_type: string;
  meal_name: string;
  description: string | null;
  time: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
  day_of_week: number;
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const MealPlanDetail = ({ mealPlanId, onBack, onUpdate }: { mealPlanId: string; onBack: () => void; onUpdate: () => void }) => {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [mealItems, setMealItems] = useState<MealPlanItem[]>([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMealPlan = async () => {
    const { data: planData, error: planError } = await supabase
      .from("meal_plans")
      .select("*")
      .eq("id", mealPlanId)
      .single();

    if (planError) {
      console.error("Error fetching meal plan:", planError);
      return;
    }

    const { data: itemsData, error: itemsError } = await supabase
      .from("meal_plan_items")
      .select("*")
      .eq("meal_plan_id", mealPlanId)
      .order("day_of_week")
      .order("time");

    if (itemsError) {
      console.error("Error fetching meal items:", itemsError);
    }

    setMealPlan(planData);
    setMealItems(itemsData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMealPlan();
  }, [mealPlanId]);

  const deleteMealItem = async (itemId: string) => {
    const { error } = await supabase
      .from("meal_plan_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      toast.error("Failed to delete meal item");
    } else {
      toast.success("Meal item deleted");
      fetchMealPlan();
    }
  };

  const copyWeekMeals = async (fromDay: number, toDay: number) => {
    const mealsToCopy = mealItems.filter(item => item.day_of_week === fromDay);
    
    if (mealsToCopy.length === 0) {
      toast.error("No meals to copy from this day");
      return;
    }

    const newMeals = mealsToCopy.map((item) => ({
      meal_plan_id: mealPlanId,
      meal_type: item.meal_type,
      meal_name: item.meal_name,
      description: item.description,
      time: item.time,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fats: item.fats,
      day_of_week: toDay,
    }));

    const { error } = await supabase
      .from("meal_plan_items")
      .insert(newMeals);

    if (error) {
      toast.error("Failed to copy meals");
      console.error(error);
    } else {
      toast.success(`Copied ${mealsToCopy.length} meals to ${DAYS[toDay]}`);
      fetchMealPlan();
    }
  };

  const dayItems = mealItems.filter(item => item.day_of_week === selectedDay);

  if (loading || !mealPlan) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <Button
            variant="ghost"
            className="w-fit mb-4"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Meal Plans
          </Button>
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-xl sm:text-2xl">{mealPlan.title}</CardTitle>
              <CardDescription>
                {format(new Date(mealPlan.start_date), "MMM dd, yyyy")} - {format(new Date(mealPlan.end_date), "MMM dd, yyyy")}
              </CardDescription>
              {mealPlan.description && <p className="mt-2 text-sm">{mealPlan.description}</p>}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <CopyWeekDialog
                selectedDay={selectedDay}
                onCopyWeek={copyWeekMeals}
              />
              <Button onClick={() => setAddDialogOpen(true)} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Meal
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedDay.toString()} onValueChange={(v) => setSelectedDay(Number(v))}>
            <TabsList className="grid grid-cols-7 w-full overflow-x-auto">
              {DAYS.map((day, index) => (
                <TabsTrigger 
                  key={index} 
                  value={index.toString()}
                  className="text-xs sm:text-sm px-2 sm:px-3"
                >
                  <span className="hidden sm:inline">{day.slice(0, 3)}</span>
                  <span className="sm:hidden">{day.slice(0, 1)}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {DAYS.map((_, index) => (
              <TabsContent key={index} value={index.toString()}>
                {dayItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No meals planned for {DAYS[index]}</p>
                  </div>
                ) : (
                  <div className="space-y-4 mt-4">
                    {dayItems.map((item) => (
                      <div key={item.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">{item.meal_name}</span>
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{item.meal_type}</span>
                              {item.time && <span className="text-sm text-muted-foreground">{item.time}</span>}
                            </div>
                            {item.description && <p className="text-sm text-muted-foreground mb-2">{item.description}</p>}
                            <div className="flex gap-4 text-sm">
                              {item.calories && <span>Calories: {item.calories}</span>}
                              {item.protein && <span>Protein: {item.protein}g</span>}
                              {item.carbs && <span>Carbs: {item.carbs}g</span>}
                              {item.fats && <span>Fats: {item.fats}g</span>}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMealItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <AddMealItemDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        mealPlanId={mealPlanId}
        selectedDay={selectedDay}
        onMealAdded={fetchMealPlan}
      />
    </>
  );
};

const AddMealItemDialog = ({
  open,
  onOpenChange,
  mealPlanId,
  selectedDay,
  onMealAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealPlanId: string;
  selectedDay: number;
  onMealAdded: () => void;
}) => {
  const [formData, setFormData] = useState({
    meal_type: "breakfast",
    meal_name: "",
    description: "",
    time: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.meal_name) {
      toast.error("Meal name is required");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("meal_plan_items").insert({
      meal_plan_id: mealPlanId,
      day_of_week: selectedDay,
      meal_type: formData.meal_type,
      meal_name: formData.meal_name,
      description: formData.description || null,
      time: formData.time || null,
      calories: formData.calories ? Number(formData.calories) : null,
      protein: formData.protein ? Number(formData.protein) : null,
      carbs: formData.carbs ? Number(formData.carbs) : null,
      fats: formData.fats ? Number(formData.fats) : null,
    });

    setLoading(false);

    if (error) {
      toast.error("Failed to add meal");
      console.error(error);
    } else {
      toast.success("Meal added successfully");
      setFormData({
        meal_type: "breakfast",
        meal_name: "",
        description: "",
        time: "",
        calories: "",
        protein: "",
        carbs: "",
        fats: "",
      });
      onOpenChange(false);
      onMealAdded();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Meal for {DAYS[selectedDay]}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Meal Type *</Label>
            <Select value={formData.meal_type} onValueChange={(value) => setFormData({ ...formData, meal_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meal_name">Meal Name *</Label>
            <Input
              id="meal_name"
              value={formData.meal_name}
              onChange={(e) => setFormData({ ...formData, meal_name: e.target.value })}
              placeholder="e.g., Oatmeal with berries"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Meal details and preparation notes"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                type="number"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                step="0.1"
                value={formData.protein}
                onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input
                id="carbs"
                type="number"
                step="0.1"
                value={formData.carbs}
                onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fats">Fats (g)</Label>
              <Input
                id="fats"
                type="number"
                step="0.1"
                value={formData.fats}
                onChange={(e) => setFormData({ ...formData, fats: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Meal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const CopyWeekDialog = ({
  selectedDay,
  onCopyWeek,
}: {
  selectedDay: number;
  onCopyWeek: (fromDay: number, toDay: number) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [targetDay, setTargetDay] = useState<number>(0);

  const handleCopy = () => {
    onCopyWeek(selectedDay, targetDay);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" onClick={() => setOpen(true)} className="w-full sm:w-auto">
        <Copy className="h-4 w-4 mr-2" />
        Copy Day
      </Button>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Copy {DAYS[selectedDay]}'s Meals</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Copy all meals from {DAYS[selectedDay]} to another day
          </p>
          <div className="space-y-2">
            <Label>Copy to:</Label>
            <Select value={targetDay.toString()} onValueChange={(v) => setTargetDay(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((day, index) => (
                  <SelectItem key={index} value={index.toString()} disabled={index === selectedDay}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCopy}>
              Copy Meals
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MealPlanDetail;
