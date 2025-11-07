import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Clock, Users, Flame, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Recipe = {
  id: string;
  name: string;
  description: string;
  instructions: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

const RecipeLibrary = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    instructions: "",
    prep_time: 0,
    cook_time: 0,
    servings: 1,
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("nutritionist_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching recipes:", error);
    } else {
      setRecipes(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!formData.name.trim()) {
      toast.error("Recipe name is required");
      return;
    }
    if (formData.name.length > 200) {
      toast.error("Recipe name must be less than 200 characters");
      return;
    }
    if (formData.description && formData.description.length > 500) {
      toast.error("Description must be less than 500 characters");
      return;
    }
    if (formData.instructions && formData.instructions.length > 5000) {
      toast.error("Instructions must be less than 5000 characters");
      return;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("recipes").insert({
      ...formData,
      nutritionist_id: user.id,
    });

    if (error) {
      toast.error("Failed to create recipe");
      console.error(error);
    } else {
      toast.success("Recipe created successfully");
      setOpen(false);
      setFormData({
        name: "",
        description: "",
        instructions: "",
        prep_time: 0,
        cook_time: 0,
        servings: 1,
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
      });
      fetchRecipes();
    }
  };

  const duplicateRecipe = async (recipe: Recipe) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("recipes").insert({
      name: `${recipe.name} (Copy)`,
      description: recipe.description,
      instructions: recipe.instructions,
      prep_time: recipe.prep_time,
      cook_time: recipe.cook_time,
      servings: recipe.servings,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fats: recipe.fats,
      nutritionist_id: user.id,
    });

    if (error) {
      toast.error("Failed to duplicate recipe");
      console.error(error);
    } else {
      toast.success("Recipe duplicated successfully");
      fetchRecipes();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Recipe Library</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Recipe
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Recipe</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Recipe Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  maxLength={200}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  maxLength={500}
                />
              </div>
              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  rows={6}
                  maxLength={5000}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prep_time">Prep Time (min)</Label>
                  <Input
                    id="prep_time"
                    type="number"
                    value={formData.prep_time}
                    onChange={(e) => setFormData({ ...formData, prep_time: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="cook_time">Cook Time (min)</Label>
                  <Input
                    id="cook_time"
                    type="number"
                    value={formData.cook_time}
                    onChange={(e) => setFormData({ ...formData, cook_time: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="servings">Servings</Label>
                  <Input
                    id="servings"
                    type="number"
                    value={formData.servings}
                    onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    step="0.1"
                    value={formData.protein}
                    onChange={(e) => setFormData({ ...formData, protein: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    step="0.1"
                    value={formData.carbs}
                    onChange={(e) => setFormData({ ...formData, carbs: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="fats">Fats (g)</Label>
                  <Input
                    id="fats"
                    type="number"
                    step="0.1"
                    value={formData.fats}
                    onChange={(e) => setFormData({ ...formData, fats: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">Create Recipe</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <Card key={recipe.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="cursor-pointer" onClick={() => setSelectedRecipe(recipe)}>
              <CardTitle className="text-base sm:text-lg">{recipe.name}</CardTitle>
              <CardDescription className="line-clamp-2">{recipe.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {recipe.prep_time + recipe.cook_time}min
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {recipe.servings} servings
                </div>
                <div className="flex items-center gap-1">
                  <Flame className="h-4 w-4" />
                  {recipe.calories}cal
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">P: {recipe.protein}g</Badge>
                <Badge variant="secondary">C: {recipe.carbs}g</Badge>
                <Badge variant="secondary">F: {recipe.fats}g</Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateRecipe(recipe);
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicate Recipe
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRecipe?.name}</DialogTitle>
          </DialogHeader>
          {selectedRecipe && (
            <div className="space-y-4">
              <p className="text-muted-foreground">{selectedRecipe.description}</p>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Prep: {selectedRecipe.prep_time}min | Cook: {selectedRecipe.cook_time}min
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {selectedRecipe.servings} servings
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Nutrition (per serving)</h4>
                <div className="grid grid-cols-4 gap-2">
                  <Badge variant="outline">
                    <Flame className="h-3 w-3 mr-1" />
                    {selectedRecipe.calories}cal
                  </Badge>
                  <Badge variant="outline">P: {selectedRecipe.protein}g</Badge>
                  <Badge variant="outline">C: {selectedRecipe.carbs}g</Badge>
                  <Badge variant="outline">F: {selectedRecipe.fats}g</Badge>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Instructions</h4>
                <p className="whitespace-pre-wrap text-sm">{selectedRecipe.instructions}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecipeLibrary;