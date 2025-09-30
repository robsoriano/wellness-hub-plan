import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  ClipboardList, 
  Bell,
  BarChart3,
  Utensils
} from "lucide-react";

const features = [
  {
    icon: ClipboardList,
    title: "Custom Diet Plans",
    description: "Create and manage personalized meal plans tailored to each patient's needs and goals.",
    color: "text-primary"
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Visual insights and analytics to monitor patient progress and adjust plans accordingly.",
    color: "text-secondary"
  },
  {
    icon: MessageSquare,
    title: "Integrated Messaging",
    description: "Seamless communication between nutritionists and patients for real-time support.",
    color: "text-accent"
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Streamline check-ins and appointments with built-in scheduling tools.",
    color: "text-primary"
  },
  {
    icon: Utensils,
    title: "Recipe Library",
    description: "Access personalized recipes and meal suggestions based on dietary preferences.",
    color: "text-secondary"
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description: "Automated notifications to keep patients engaged and on track with their goals.",
    color: "text-accent"
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track active vs. inactive users with comprehensive dashboard insights.",
    color: "text-primary"
  },
  {
    icon: Users,
    title: "Patient Management",
    description: "Efficiently manage multiple patients with organized profiles and histories.",
    color: "text-secondary"
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything You Need in One Platform
          </h2>
          <p className="text-lg text-muted-foreground">
            From diet creation to progress tracking, NutriTrack provides all the tools 
            nutritionists and patients need for success.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card"
              >
                <CardHeader>
                  <div className={`h-12 w-12 rounded-lg bg-${feature.color.replace('text-', '')}/10 flex items-center justify-center mb-4`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
