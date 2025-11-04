import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ApplyTemplateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealPlanId: string;
  onSuccess: () => void;
};

type MealTemplate = {
  id: string;
  name: string;
  category: string;
};

const ApplyTemplateDialog = ({ open, onOpenChange, mealPlanId, onSuccess }: ApplyTemplateDialogProps) => {
  const [templates, setTemplates] = useState<MealTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [targetDay, setTargetDay] = useState("0");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  const fetchTemplates = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("meal_templates")
      .select("*")
      .eq("nutritionist_id", user.id)
      .order("name");

    if (error) {
      console.error("Error fetching templates:", error);
    } else {
      setTemplates(data || []);
    }
  };

  const handleApply = async () => {
    if (!selectedTemplate) {
      toast.error("Please select a template");
      return;
    }

    setLoading(true);

    try {
      // Fetch template items
      const { data: templateItems, error: fetchError } = await supabase
        .from("meal_template_items")
        .select("*")
        .eq("meal_template_id", selectedTemplate);

      if (fetchError) throw fetchError;

      if (!templateItems || templateItems.length === 0) {
        toast.error("This template has no meals");
        setLoading(false);
        return;
      }

      // Transform and insert into meal plan
      const mealPlanItems = templateItems.map(item => ({
        meal_plan_id: mealPlanId,
        day_of_week: parseInt(targetDay),
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
        .from("meal_plan_items")
        .insert(mealPlanItems);

      if (insertError) throw insertError;

      toast.success("Template applied successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error applying template:", error);
      toast.error("Failed to apply template");
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = [
    { value: "0", label: "Monday" },
    { value: "1", label: "Tuesday" },
    { value: "2", label: "Wednesday" },
    { value: "3", label: "Thursday" },
    { value: "4", label: "Friday" },
    { value: "5", label: "Saturday" },
    { value: "6", label: "Sunday" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply Meal Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Select Template</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} ({template.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Apply to Day</Label>
            <Select value={targetDay} onValueChange={setTargetDay}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {daysOfWeek.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleApply} disabled={loading} className="flex-1">
              {loading ? "Applying..." : "Apply Template"}
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

export default ApplyTemplateDialog;
