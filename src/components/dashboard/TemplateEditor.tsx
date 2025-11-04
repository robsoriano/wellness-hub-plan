import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

type MealTemplateItem = {
  id: string;
  meal_type: string;
  meal_name: string;
  description: string | null;
  time: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
};

type TemplateEditorProps = {
  templateId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const TemplateEditor = ({ templateId, open, onOpenChange }: TemplateEditorProps) => {
  const [meals, setMeals] = useState<MealTemplateItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
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

  useEffect(() => {
    if (templateId && open) {
      fetchMeals();
    }
  }, [templateId, open]);

  const fetchMeals = async () => {
    if (!templateId) return;
    
    const { data, error } = await supabase
      .from("meal_template_items")
      .select("*")
      .eq("meal_template_id", templateId)
      .order("meal_type");

    if (error) {
      console.error("Error fetching meals:", error);
    } else {
      setMeals(data || []);
    }
  };

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateId) return;

    const { error } = await supabase.from("meal_template_items").insert({
      meal_template_id: templateId,
      meal_type: formData.meal_type,
      meal_name: formData.meal_name,
      description: formData.description || null,
      time: formData.time || null,
      calories: formData.calories ? parseInt(formData.calories) : null,
      protein: formData.protein ? parseFloat(formData.protein) : null,
      carbs: formData.carbs ? parseFloat(formData.carbs) : null,
      fats: formData.fats ? parseFloat(formData.fats) : null,
    });

    if (error) {
      toast.error("Failed to add meal");
      console.error(error);
    } else {
      toast.success("Meal added successfully");
      setShowAddForm(false);
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
      fetchMeals();
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    const { error } = await supabase
      .from("meal_template_items")
      .delete()
      .eq("id", mealId);

    if (error) {
      toast.error("Failed to delete meal");
    } else {
      toast.success("Meal deleted");
      fetchMeals();
    }
  };

  const mealTypes = ["breakfast", "lunch", "dinner", "snack"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Template Meals</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Existing Meals */}
          {mealTypes.map((mealType) => {
            const typeMeals = meals.filter(m => m.meal_type === mealType);
            if (typeMeals.length === 0) return null;

            return (
              <div key={mealType} className="space-y-2">
                <h3 className="font-semibold capitalize">{mealType}</h3>
                {typeMeals.map((meal) => (
                  <Card key={meal.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{meal.meal_name}</p>
                          {meal.description && (
                            <p className="text-sm text-muted-foreground">{meal.description}</p>
                          )}
                          <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                            {meal.time && <span>⏰ {meal.time}</span>}
                            {meal.calories && <span>🔥 {meal.calories} cal</span>}
                            {meal.protein && <span>P: {meal.protein}g</span>}
                            {meal.carbs && <span>C: {meal.carbs}g</span>}
                            {meal.fats && <span>F: {meal.fats}g</span>}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMeal(meal.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            );
          })}

          {/* Add Meal Form */}
          {!showAddForm ? (
            <Button onClick={() => setShowAddForm(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Meal
            </Button>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleAddMeal} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Meal Type</Label>
                      <Select
                        value={formData.meal_type}
                        onValueChange={(value) => setFormData({ ...formData, meal_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {mealTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Time</Label>
                      <Input
                        placeholder="e.g., 8:00 AM"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Meal Name</Label>
                    <Input
                      placeholder="e.g., Greek Yogurt Bowl"
                      value={formData.meal_name}
                      onChange={(e) => setFormData({ ...formData, meal_name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Meal details..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <Label>Calories</Label>
                      <Input
                        type="number"
                        placeholder="350"
                        value={formData.calories}
                        onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Protein (g)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="20"
                        value={formData.protein}
                        onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Carbs (g)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="45"
                        value={formData.carbs}
                        onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Fats (g)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="12"
                        value={formData.fats}
                        onChange={(e) => setFormData({ ...formData, fats: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">Add Meal</Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateEditor;
