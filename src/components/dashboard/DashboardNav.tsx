import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Apple, LogOut, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import NotificationBell from "./NotificationBell";

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
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Apple className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <span className="font-bold text-base sm:text-lg">NutriTrack</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="hidden md:inline text-sm text-muted-foreground">Welcome, {userName}</span>
          <NotificationBell />
          <Button variant="ghost" size="sm" onClick={() => navigate("/messages")} className="hidden sm:flex">
            <MessageSquare className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Messages</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate("/messages")} className="sm:hidden">
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleSignOut} className="hidden sm:flex">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
          <Button variant="outline" size="icon" onClick={handleSignOut} className="sm:hidden">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNav;
