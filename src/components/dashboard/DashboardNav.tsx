import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Apple, LogOut, MessageSquare } from "lucide-react";
import { toast } from "sonner";

type DashboardNavProps = {
  userName: string;
};

const DashboardNav = ({ userName }: DashboardNavProps) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Apple className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">NutriTrack</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Welcome, {userName}</span>
          <Button variant="ghost" size="sm" onClick={() => navigate("/messages")}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Messages
          </Button>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNav;
