import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AddProgressLogDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  onLogAdded: () => void;
};

const AddProgressLogDialog = ({
  open,
  onOpenChange,
  patientId,
  onLogAdded,
}: AddProgressLogDialogProps) => {
  const [logDate, setLogDate] = useState<Date>(new Date());
  const [weight, setWeight] = useState("");
  const [energyLevel, setEnergyLevel] = useState([5]);
  const [mood, setMood] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!logDate) {
      toast.error("Please select a date");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("progress_logs").insert({
      patient_id: patientId,
      log_date: format(logDate, "yyyy-MM-dd"),
      weight: weight ? Number(weight) : null,
      energy_level: energyLevel[0],
      mood: mood || null,
      notes: notes || null,
    });

    setLoading(false);

    if (error) {
      toast.error("Failed to add progress log");
      console.error(error);
    } else {
      toast.success("Progress log added successfully");
      setLogDate(new Date());
      setWeight("");
      setEnergyLevel([5]);
      setMood("");
      setNotes("");
      onOpenChange(false);
      onLogAdded();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Progress Log</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Log Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !logDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {logDate ? format(logDate, "PPP") : "Pick date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={logDate}
                  onSelect={(date) => date && setLogDate(date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter weight"
            />
          </div>

          <div className="space-y-2">
            <Label>Energy Level: {energyLevel[0]}/10</Label>
            <Slider
              value={energyLevel}
              onValueChange={setEnergyLevel}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mood">Mood</Label>
            <Input
              id="mood"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="e.g., Energetic, Tired, Great"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes"
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Log"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProgressLogDialog;
