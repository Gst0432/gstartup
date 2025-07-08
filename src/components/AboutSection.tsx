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
    <section id="about" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold text-primary">
                {t('aboutTitle')}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('aboutDescription')}
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-muted-foreground">
                G-STARTUP LTD est l'un des pionniers de la fourniture d'infrastructures et de solutions informatiques. 
                Nous nous concentrons entièrement sur la fourniture de services Cloud et de solutions logicielles de haute qualité.
              </p>
              
              {/* Features List */}
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="outline" className="gap-2">
              Read More
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Right Stats */}
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center p-6 bg-card rounded-xl shadow-elegant">
              <div className="text-4xl font-bold text-primary mb-2">100+</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wide">
                Completed Work
              </div>
            </div>
            
            <div className="text-center p-6 bg-card rounded-xl shadow-elegant">
              <div className="text-4xl font-bold text-primary mb-2">4+</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wide">
                Years Experience
              </div>
            </div>
            
            <div className="text-center p-6 bg-card rounded-xl shadow-elegant">
              <div className="text-4xl font-bold text-primary mb-2">30+</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wide">
                Completed Projects
              </div>
            </div>
            
            <div className="text-center p-6 bg-card rounded-xl shadow-elegant">
              <div className="text-4xl font-bold text-primary mb-2">3,700+</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wide">
                Happy Customers
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};