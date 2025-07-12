import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import heroIllustration from '../assets/hero-illustration.png';

export const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-10 sm:top-20 left-4 sm:left-10 w-12 sm:w-20 h-12 sm:h-20 bg-primary/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-10 sm:bottom-20 right-4 sm:right-10 w-20 sm:w-32 h-20 sm:h-32 bg-primary-glow/10 rounded-full blur-2xl"></div>
      
      <div className="container mx-auto px-4 py-10 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
            {/* Business Marketing Badge */}
            <div className="flex gap-2 sm:gap-4 text-xs sm:text-sm font-medium justify-center lg:justify-start">
              <span className="px-2 sm:px-3 py-1 bg-primary/10 text-primary rounded-full">
                BUSINESS
              </span>
              <span className="px-2 sm:px-3 py-1 bg-primary/10 text-primary rounded-full">
                MARKETING
              </span>
            </div>

            {/* Main Title */}
            <div className="space-y-3 lg:space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-7xl font-bold leading-tight">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  {t('heroTitle')}
                </span>
              </h1>
              <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold text-foreground">
                {t('heroSubtitle')}
              </h2>
            </div>

            {/* Description */}
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
              {t('heroDescription')}
            </p>

            {/* CTA Button */}
            <div className="pt-2 lg:pt-4">
              <Button 
                size="lg" 
                variant="hero" 
                className="gap-2 text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto"
                onClick={() => window.location.href = '/marketplace'}
              >
                {t('getStarted')}
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative order-first lg:order-last">
            <div className="relative z-10">
              <img 
                src={heroIllustration} 
                alt="Business Team Collaboration"
                className="w-full h-auto max-w-md sm:max-w-lg lg:max-w-2xl mx-auto"
              />
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 w-8 sm:w-12 lg:w-16 h-8 sm:h-12 lg:h-16 bg-primary/20 rounded-lg rotate-12 animate-pulse"></div>
            <div className="absolute -bottom-2 sm:-bottom-4 -left-2 sm:-left-4 w-6 sm:w-8 lg:w-12 h-6 sm:h-8 lg:h-12 bg-primary-glow/20 rounded-full animate-bounce"></div>
            
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-primary opacity-10 blur-3xl scale-110"></div>
          </div>
        </div>
      </div>
    </section>
  );
};