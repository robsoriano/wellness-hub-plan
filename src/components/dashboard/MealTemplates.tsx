import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, FileText, Eye, Copy, Edit } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import TemplateEditor from "./TemplateEditor";

type MealTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
};

type MealTemplateItem = {
  id: string;
  meal_template_id: string;
  meal_type: string;
  meal_name: string;
  description: string | null;
  time: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fats: number | null;
};

const MealTemplates = () => {
  const [templates, setTemplates] = useState<MealTemplate[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [viewTemplateOpen, setViewTemplateOpen] = useState(false);
  const [editTemplateOpen, setEditTemplateOpen] = useState(false);
  const [templateItems, setTemplateItems] = useState<MealTemplateItem[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "breakfast",
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("meal_templates")
      .select("*")
      .eq("nutritionist_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching templates:", error);
    } else {
      setTemplates(data || []);
    }
  };

  const fetchTemplateItems = async (templateId: string) => {
    const { data, error } = await supabase
      .from("meal_template_items")
      .select("*")
      .eq("meal_template_id", templateId)
      .order("meal_type");

    if (error) {
      console.error("Error fetching template items:", error);
      return [];
    }
    return data || [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("meal_templates").insert({
      ...formData,
      nutritionist_id: user.id,
    });

    if (error) {
      toast.error("Failed to create template");
      console.error(error);
    } else {
      toast.success("Template created successfully");
      setOpen(false);
      setFormData({ name: "", description: "", category: "breakfast" });
      fetchTemplates();
    }
  };

  const handleViewTemplate = async (templateId: string) => {
    const items = await fetchTemplateItems(templateId);
    setTemplateItems(items);
    setSelectedTemplate(templateId);
    setViewTemplateOpen(true);
  };

  const handleEditTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    setEditTemplateOpen(true);
  };

  const categories = ["breakfast", "lunch", "dinner", "snack", "full-day"];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Meal Templates</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Meal Template</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
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
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Create Template</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <Badge variant="secondary" className="capitalize">{template.category}</Badge>
              </div>
              <CardTitle className="mt-2">{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => handleViewTemplate(template.id)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => handleEditTemplate(template.id)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Meals
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Template Dialog */}
      <Dialog open={viewTemplateOpen} onOpenChange={setViewTemplateOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {templateItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No meals in this template yet. Click "Edit Meals" to add meals.
              </p>
            ) : (
              <div className="space-y-4">
                {["breakfast", "lunch", "dinner", "snack"].map((mealType) => {
                  const meals = templateItems.filter(item => item.meal_type === mealType);
                  if (meals.length === 0) return null;
                  
                  return (
                    <div key={mealType}>
                      <h3 className="font-semibold capitalize mb-2">{mealType}</h3>
                      <div className="space-y-2">
                        {meals.map((meal) => (
                          <Card key={meal.id}>
                            <CardContent className="pt-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{meal.meal_name}</p>
                                  {meal.description && (
                                    <p className="text-sm text-muted-foreground">{meal.description}</p>
                                  )}
                                  {meal.time && (
                                    <p className="text-xs text-muted-foreground mt-1">Time: {meal.time}</p>
                                  )}
                                </div>
                                <div className="text-right text-sm">
                                  {meal.calories && <p>{meal.calories} cal</p>}
                                  {meal.protein && <p className="text-muted-foreground">P: {meal.protein}g</p>}
                                  {meal.carbs && <p className="text-muted-foreground">C: {meal.carbs}g</p>}
                                  {meal.fats && <p className="text-muted-foreground">F: {meal.fats}g</p>}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Editor */}
      <TemplateEditor
        templateId={selectedTemplate}
        open={editTemplateOpen}
        onOpenChange={setEditTemplateOpen}
      />
    </div>
  );
};

export default MealTemplates;