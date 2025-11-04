import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type SaveAsTemplateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealPlanId: string;
  sourceDay?: number;
};

const SaveAsTemplateDialog = ({ open, onOpenChange, mealPlanId, sourceDay }: SaveAsTemplateDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "full-day",
  });

  const handleSave = async () => {
    if (!formData.name) {
      toast.error("Please enter a template name");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create template
      const { data: template, error: templateError } = await supabase
        .from("meal_templates")
        .insert({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          nutritionist_id: user.id,
        })
        .select()
        .single();

      if (templateError) throw templateError;

      // Fetch meal plan items
      let query = supabase
        .from("meal_plan_items")
        .select("*")
        .eq("meal_plan_id", mealPlanId);

      // If sourceDay is specified, only copy that day
      if (sourceDay !== undefined) {
        query = query.eq("day_of_week", sourceDay);
      }

      const { data: mealItems, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      if (!mealItems || mealItems.length === 0) {
        toast.error("No meals found to save");
        setLoading(false);
        return;
      }

      // Transform and insert template items
      const templateItems = mealItems.map(item => ({
        meal_template_id: template.id,
        meal_type: item.meal_type,
        meal_name: item.meal_name,
        description: item.description,
        time: item.time,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fats: item.fats,
      }));

      const { error: insertError } = await supabase
        .from("meal_template_items")
        .insert(templateItems);

      if (insertError) throw insertError;

      toast.success("Template created successfully");
      onOpenChange(false);
      setFormData({ name: "", description: "", category: "full-day" });
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    } finally {
      setLoading(false);
    }
  };

  const categories = ["breakfast", "lunch", "dinner", "snack", "full-day"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Template Name</Label>
            <Input
              placeholder="e.g., High Protein Monday"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              placeholder="Describe this meal template..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <Label>Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1).replace("-", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading} className="flex-1">
              {loading ? "Saving..." : "Save Template"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaveAsTemplateDialog;
