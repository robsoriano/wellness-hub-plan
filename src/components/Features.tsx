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
import { useLanguage } from "@/contexts/LanguageContext";

const Features = () => {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: ClipboardList,
      title: t('features.customDiet'),
      description: t('features.customDietDesc'),
      color: "text-primary"
    },
    {
      icon: TrendingUp,
      title: t('features.progressTracking'),
      description: t('features.progressTrackingDesc'),
      color: "text-secondary"
    },
    {
      icon: MessageSquare,
      title: t('features.messaging'),
      description: t('features.messagingDesc'),
      color: "text-accent"
    },
    {
      icon: Calendar,
      title: t('features.scheduling'),
      description: t('features.schedulingDesc'),
      color: "text-primary"
    },
    {
      icon: Utensils,
      title: t('features.recipeLibrary'),
      description: t('features.recipeLibraryDesc'),
      color: "text-secondary"
    },
    {
      icon: Bell,
      title: t('features.reminders'),
      description: t('features.remindersDesc'),
      color: "text-accent"
    },
    {
      icon: BarChart3,
      title: t('features.analytics'),
      description: t('features.analyticsDesc'),
      color: "text-primary"
    },
    {
      icon: Users,
      title: t('features.patientMgmt'),
      description: t('features.patientMgmtDesc'),
      color: "text-secondary"
    }
  ];

  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t('features.title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('features.description')}
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
