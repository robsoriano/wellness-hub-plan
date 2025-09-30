import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  title: string;
  userName?: string;
}

const DashboardHeader = ({ title, userName }: DashboardHeaderProps) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      navigate("/auth");
    }
  };

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">NutriTrack</h1>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
        <div className="flex items-center gap-4">
          {userName && <span className="text-sm">Welcome, {userName}</span>}
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
