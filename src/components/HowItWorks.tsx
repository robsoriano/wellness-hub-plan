import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, ClipboardEdit, TrendingUp, Award } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const HowItWorks = () => {
  const { t } = useLanguage();
  
  const steps = [
    {
      icon: UserPlus,
      title: t('howItWorks.step1'),
      description: t('howItWorks.step1Desc'),
      step: "01"
    },
    {
      icon: ClipboardEdit,
      title: t('howItWorks.step2'),
      description: t('howItWorks.step2Desc'),
      step: "02"
    },
    {
      icon: TrendingUp,
      title: t('howItWorks.step3'),
      description: t('howItWorks.step3Desc'),
      step: "03"
    },
    {
      icon: Award,
      title: t('howItWorks.step4'),
      description: t('howItWorks.step4Desc'),
      step: "04"
    }
  ];

  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t('howItWorks.title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('howItWorks.description')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <Card className="relative border-border bg-card hover:shadow-lg transition-all duration-300">
                  <CardContent className="pt-6 text-center">
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                        <Icon className="h-7 w-7 text-primary-foreground" />
                      </div>
                    </div>
                    
                    <div className="mt-8 mb-4">
                      <span className="text-6xl font-bold text-muted/20">{step.step}</span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {step.title}
                    </h3>
                    
                    <p className="text-muted-foreground">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
                
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-secondary opacity-30"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
