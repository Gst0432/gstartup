import { Button } from './ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export const AboutSection = () => {
  const { t } = useLanguage();

  const features = [
    'High Quality Cloud Service',
    'International Client Projects',
    'Multi-platform Solutions',
    'Expert Development Team'
  ];

  return (
    <section id="about" className="py-12 sm:py-16 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
            <div className="space-y-3 lg:space-y-4">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold">
                {t('aboutTitle')}
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                {t('aboutDescription')}
              </p>
            </div>

            <div className="space-y-3 lg:space-y-4">
              <p className="text-sm sm:text-base text-muted-foreground">
                {t('aboutExtended')}
              </p>
              
              {/* Features List */}
              <div className="space-y-2 lg:space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 lg:gap-3 justify-center lg:justify-start">
                    <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-primary flex-shrink-0" />
                    <span className="text-sm sm:text-base text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              variant="outline" 
              className="gap-2 w-full sm:w-auto"
              onClick={() => window.location.href = '/about'}
            >
              {t('readMore')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Right Stats */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8 order-first lg:order-last">
            <div className="text-center p-4 sm:p-6 bg-card rounded-xl shadow-elegant">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-1 sm:mb-2">100+</div>
              <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">
                {t('completedWork')}
              </div>
            </div>
            
            <div className="text-center p-4 sm:p-6 bg-card rounded-xl shadow-elegant">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-1 sm:mb-2">4+</div>
              <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">
                {t('yearsExperience')}
              </div>
            </div>
            
            <div className="text-center p-4 sm:p-6 bg-card rounded-xl shadow-elegant">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-1 sm:mb-2">30+</div>
              <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">
                {t('completedProjects')}
              </div>
            </div>
            
            <div className="text-center p-4 sm:p-6 bg-card rounded-xl shadow-elegant">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-1 sm:mb-2">3,700+</div>
              <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">
                {t('happyCustomers')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};