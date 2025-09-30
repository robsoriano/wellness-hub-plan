import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Apple, Users, BarChart, MessageSquare } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            NutriTrack
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Simplify and personalize your nutrition journey
          </p>
          <Button size="lg" onClick={() => navigate("/auth")}>
            Get Started
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="p-6 bg-card rounded-lg border">
            <Users className="h-12 w-12 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Patient Management</h3>
            <p className="text-sm text-muted-foreground">
              Track and manage all your patients in one place
            </p>
          </div>
          
          <div className="p-6 bg-card rounded-lg border">
            <Apple className="h-12 w-12 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Custom Meal Plans</h3>
            <p className="text-sm text-muted-foreground">
              Create personalized nutrition plans tailored to each patient
            </p>
          </div>
          
          <div className="p-6 bg-card rounded-lg border">
            <BarChart className="h-12 w-12 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Progress Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Monitor patient progress with visual insights and analytics
            </p>
          </div>
          
          <div className="p-6 bg-card rounded-lg border">
            <MessageSquare className="h-12 w-12 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Direct Messaging</h3>
            <p className="text-sm text-muted-foreground">
              Communicate seamlessly with your nutritionist or patients
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
